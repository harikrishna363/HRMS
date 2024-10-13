const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const jwt = require('jsonwebtoken');
const numberToWords = require('number-to-words');
const { format } = require('date-fns');
require('dotenv').config();
const nodemailer = require('nodemailer');
const multer = require('multer');
const { Parser } = require('json2csv');
const moment = require('moment');
const storage = multer.memoryStorage(); 

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
        fieldSize: 2 * 1024 * 1024, // Limit field size to 2MB
    },
});

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());

const dbPath = path.join(__dirname, 'hrms.db');
let db = null;

function capitalizeFirstLetter(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

const PORT = process.env.PORT || 4000;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.run('PRAGMA foreign_keys = ON');

    app.listen(PORT, () => {
      console.log(`Server Running at port ${PORT}`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com', // Outlook SMTP host
  port: 587, // TLS port
  secure: false, // Use TLS (not SSL)
  auth: {
    user: process.env.OUTLOOK_USER, // Your Outlook email address
    pass: process.env.OUTLOOK_PASS  // Your Outlook email password
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"]
  if (authHeader !== undefined){
    jwtToken = authHeader.split(" ")[1]
  }
 
  if (jwtToken === undefined){
    response.status(401)
    response.send("Invalid JWT Token");
  }else{
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
}

app.post('/api/send-mail', authenticateToken, async (req, res) => {
  const { selectedTemplate, employeeMails } = req.body;

  const query = `SELECT * FROM email_templates WHERE name = ?`;

  try {
    const template = await db.get(query, [selectedTemplate])

    for (let email of employeeMails) {
      const mailOptions = {
        from: process.env.OUTLOOK_USER,
        to: email,
        cc: process.env.OUTLOOK_CC,
        subject: template.subject,
        text: template.text,
        html: template.html
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${email}`);
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        // You can choose to continue or break the loop based on error preference
      }
    }

    // Respond with success after sending all emails
    res.status(200).json({success: 'Email Sent Successfully'});

  } catch (err) {
    console.error(err);
    res.status(500).json({failure: 'Failed to Send Emails'});
  }
});

app.get('/api/email-template/:templateName', authenticateToken, async (req, res) => {
  const { templateName } = req.params;
  try {
    const template = await db.get('SELECT * FROM email_templates WHERE name = ?', [templateName]);
    if (template) {
      res.json(template);
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error fetching email template' });
  }
});

app.get('/api/mail-templates', authenticateToken, async (req, res) => {
  const query = `SELECT * FROM email_templates`;

  try{
    const data = await db.all(query)
    res.status(200).json(data)
  } catch (err) {
    console.log(err)
    res.status(500).json({error: 'Internal Server Error'})
  }
});

app.put('/api/update-mail-template-status/:name', authenticateToken, async (req, res) => {
  const { name } = req.params;
  const { status } = req.body;

  const updateQuery = `UPDATE email_templates SET status = ? WHERE name = ?`;

  try {
    await db.run(updateQuery, [status, name]);
    res.status(200).json({ success: `${name} status updated to ${status}` });
  } catch (err) {
    console.error('Error updating employee status:', err);
    res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.post('/api/add-mail-template', authenticateToken, async (req, res) => {
  const {name, subject, text, html} = req.body

  const query = `INSERT INTO email_templates(name, subject, text, html)
                 VALUES (?, ?, ?, ?)`
  
  try{
    await db.run(query, [name, subject, text, html])
      res.status(200).json({success: `${name} Template Added Successfully`})
  } catch (err) {
    console.log(err)
    res.status(500).json( {failure: 'Internal Server Error'})
  }
})

app.put('/api/update-email-template/:templateName', authenticateToken, async (req, res) => {
  const { templateName } = req.params; 
  const { subject, text, html } = req.body; 

  const query = `UPDATE email_templates
                 SET subject = ?, text = ?, html = ?
                 WHERE name = ?`;

  try {
    await db.run(query, [subject, text, html, templateName]); 
    res.status(200).json({ success: `Saved Changes for ${templateName} Template` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: `Failed to Save Changes for ${templateName} Template` });
  }
});

// Login API
app.post("/api/login", async (request, response) => {
  const { email, password } = request.body;

  const selectUserQuery = `SELECT e.employee_id, e.first_name as name, e.password, r.role_name   
    FROM employee e 
    JOIN employee_role er ON e.employee_id = er.employee_id 
    JOIN role r ON er.role_id = r.role_id
    WHERE e.email = '${email}'`;

  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    response.status(400);
    response.send({errorMessage: "Email Not Found"});
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (isPasswordMatched) {
      const payload = {
        employee_id: dbUser.employee_id,
        name: dbUser.name,
        role: dbUser.role_name,
      };

      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send({errorMessage: "Invalid Password"});
    }
  }
});

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;

  try{
    const employee = await db.get('SELECT * FROM employee WHERE email = ?', [email])
    if (!employee){
      res.status(404).json({failure: 'Invalid Email'})
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit OTP

      let mailOptions = {
        from: process.env.OUTLOOK_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
      };

      try{
        await transporter.sendMail(mailOptions)
        await db.run("UPDATE employee SET otp = ? WHERE email = ?", [otp, email])
        res.status(200).json({success: `OTP sent to ${email}`})
        console.log(`Email sent to: ${email}`);
      }catch (error) {
        res.status(500).json({failure: 'Failed to send OTP'})
        console.error(`Error sending email to ${email}:`, error);
      }
  } catch (err) {
    console.error(err);
    res.status(500).json({failure: 'Internal Server Error'});
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try{
    const employee = await db.get("SELECT * FROM employee WHERE email = ? AND otp = ?", [email, otp])
    if (!employee){
      res.status(404).json({failure: 'Invalid OTP'})
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.run("UPDATE employee SET password = ?, otp = NULL WHERE email = ?", [hashedPassword, email])
      res.status(200).json({success: 'Password changed'})
    }
  }catch (err) {
    console.error(err);
    res.status(500).json({failure: 'Internal Server Error'});
  }
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
  const {employeeId, currentPassword, newPassword} = req.body

  const query = `UPDATE employee 
                 SET password = ?
                 WHERE employee_id = ?`
  
  try{
    const employee = await db.get(`SELECT password FROM employee WHERE employee_id = ?`, [employeeId]);

    const isPasswordMatched = await bcrypt.compare(currentPassword, employee.password);

    if (isPasswordMatched){
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await db.run(query, [hashedNewPassword, employeeId])
        res.status(200).json({success: 'Password Changed'})
    } else {
        res.status(400).json({error: 'Invalid current password'})
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({error: 'Internal Server Error'})
  }
})

app.get('/api/active-employees-count', authenticateToken, async (req, res) => {

  const query = `select
   count() as count  from employee
   where employee.status = 'Active';`;

  try{
    const data = await db.get(query);
    res.status(200).json(data)
  } catch (err) {
    console.log(err)
    res.status(500).json('Internal Server Error')
  }
  
});

app.get('/api/active-cv-count', authenticateToken, async (req, res) => {

  const query = `select
   count() as count  from cv_database
   where cv_database.active_status = 'Active';`;

  try{
    const data = await db.get(query);
    res.status(200).json(data);
  } catch (err) {
    console.log(err)
      res.status(500).json('Internal Server Error')    
  }
  
});

app.get('/api/employee', authenticateToken, async (req, res) => {
  const query = `select 
    employee_id,
    first_name || ' ' || last_name as name,
    email,
    phone_number,
    department,
    designation,
    status from employee;
  `;

  try{
    const data = await db.all(query)
      res.status(200).json(data)
  } catch (err) {
    res.status(500).json('Internal Server Error')
  }
});

app.get('/api/active-employees', authenticateToken, async (req, res) => {
  const query = `select 
    employee_id,
    first_name || ' ' || last_name as name,
    email,
    phone_number,
    department,
    designation FROM employee
    WHERE status = 'Active'
  `;

  try{
    const data = await db.all(query)
      res.status(200).json(data)
  } catch (err) {
    res.status(500).json('Internal Server Error')
  }
});

app.get('/api/employee/:employeeId', authenticateToken, async (req, res) => {
  const {employeeId} = req.params

  const query = `SELECT * 
                 FROM employee e
                 JOIN employee_personal ep
                 ON e.employee_id = ep.employee_id
                 JOIN employee_role er
                 ON e.employee_id = er.employee_id
                 JOIN role r
                 ON er.role_id = r.role_id
                 WHERE e.employee_id = ?
  `;

  try{
    const data = await db.get(query, [employeeId]);
    if (data && data.photograph) {
      // Convert the buffer to a Base64 string
      data.photograph = Buffer.from(data.photograph).toString('base64');
  }
    res.status(200).json(data)

  }catch (err) {
    console.error('Error fetching Employee details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/add-employee-form', authenticateToken, async (req, res) => {
  const employeeData = req.body;
  console.log(employeeData)

  const hashedPassword = await bcrypt.hash(employeeData.password, 10);

  const employeeQuery = `
    INSERT INTO employee (
      employee_id,
      first_name,
      last_name,
      gender,
      dob,
      phone_number,
      email,
      password,
      education_level,
      hire_date,
      employee_type,
      job_title,
      designation,
      salary,
      department,
      manager_id,
      effective_date,
      joining_date,
      status,
      remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const employeePersonalQuery = `INSERT INTO employee_personal(employee_id)
                                 VALUES (?)`

  const employeeRoleQuery = `
    INSERT INTO employee_role(employee_id, role_id)
    VALUES (?, ?)
  `;
  
  const roleMap = {
    'SUPER ADMIN': 1,
    'HR ADMIN': 2,
    'FINANCE ADMIN': 3,
    'USER': 4
  };
  
  const roleId = roleMap[employeeData.role] || '';

  try {
    await db.run('BEGIN TRANSACTION');

    await db.run(employeeQuery, [
      employeeData.employeeId,
      employeeData.firstName,
      employeeData.lastName,
      employeeData.gender,
      employeeData.dob,
      employeeData.phoneNumber,
      employeeData.mail,
      hashedPassword,
      employeeData.educationLevel,
      employeeData.hireDate,
      employeeData.employeeType,
      employeeData.jobTitle,
      employeeData.designation,
      employeeData.salary,
      employeeData.department,
      employeeData.manager_id,
      employeeData.effectiveDate,
      employeeData.joiningDate,
      'Active',
      employeeData.remarks
    ]);

    await db.run(employeePersonalQuery, [employeeData.employeeId])

    await db.run(employeeRoleQuery, [employeeData.employeeId, roleId]);
    
    await db.run('COMMIT');

    res.status(201).json({ success: `${employeeData.employeeId} Added successfully` });

  } catch (err) {
    await db.run('ROLLBACK');
    console.error('Error inserting employee data:', err);
    res.status(500).json({ failure: err.message });
  }
});

app.post('/api/add-employee-csv', authenticateToken, async (req, res) => {
  const employees = req.body; 

  const employeeQuery = `
    INSERT INTO employee (
      employee_id, first_name, last_name, gender, dob, email, password, phone_number, employee_type, education_level, 
      job_title, designation, hire_date, salary, department, manager_id, 
      effective_date, joining_date, status, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const employeePersonalQuery = `INSERT INTO employee_personal(employee_id, aadhar_number, pan_number, voter_id)
                                 VALUES (?, ?, ?, ?)`

  const employeeRoleQuery = `
    INSERT INTO employee_role(employee_id, role_id)
    VALUES (?, ?)
  `;
  
  const roleMap = {
    'SUPER ADMIN': 1,
    'HR ADMIN': 2,
    'FINANCE ADMIN': 3,
    'USER': 4
  };
  
  try {
    for (const row of employees.rows) {
      const values = row.values; 

      const hashedPassword = await bcrypt.hash(values.password, 10);

      const roleId = roleMap[values.role] || '';

      const employeeData = [
        values.employee_id ? values.employee_id.trim() : null,
        values.first_name ? values.first_name.trim() : null,
        values.last_name ? values.last_name.trim() : null,
        values.gender ? values.gender.trim() : null,
        values.dob ? values.dob.trim() : null,
        values.email ? values.email.trim() : null,
        hashedPassword,
        values.phone_number ? values.phone_number.trim() : null,
        values.employee_type ? values.employee_type.trim() : null,
        values.education_level ? values.education_level.trim() : null,
        values.job_title ? values.job_title.trim() : null,
        values.designation ? values.designation.trim() : null,
        values.hire_date ? values.hire_date.trim() : null,
        values.salary ? values.salary.trim() : null,
        values.department ? values.department.trim() : null,
        values.manager_id ? values.manager.trim() : null,
        values.effective_date ? values.effective_date.trim() : null,
        values.joining_date ? values.joining_date.trim() : null,
        'Active',
        values.remarks ? values.remarks.trim() : null
      ];

      await db.run('BEGIN TRANSACTION');

      await db.run(employeeQuery, employeeData);

      await db.run(employeePersonalQuery, [values.employee_id, values.aadhar_number, values.pan_number, values.voter_id,])

      await db.run(employeeRoleQuery, [values.employee_id, roleId])
      
      await db.run('COMMIT');

    }
  res.status(201).json({ success: `Employee(s) Added Successfully` });

  } catch (err) {
    await db.run('ROLLBACK');
    console.error(err);
    res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.get('/api/employee-report', authenticateToken, async (req, res) => {
  const query = `
          SELECT 
              e.employee_id, e.first_name, e.last_name, e.gender, e.dob, e.email, e.phone_number, 
              e.education_level, e.hire_date, e.employee_type, e.job_title, e.designation, e.salary, 
              e.department, e.manager, e.effective_date, e.joining_date, e.resignation_date, 
              e.relieving_date, e.status, e.remarks, ep.personal_email, ep.religion, ep.mother_tongue, 
              ep.educational_background, ep.hobbies, ep.anniversary_date, ep.special_certifications, 
              ep.current_residential_address, ep.permanent_residential_address, ep.marital_status, 
              ep.spouse_name, ep.children, ep.emergency_contact, ep.relation_with_contact, ep.blood_type, 
              ep.cv, ep.aadhar_card, ep.location, ep.pan_number, ep.pan_card, ep.address_proof, 
              ep.passport_copy, ep.relevant_certificates, ep.special_certificates, ep.voter_id
          FROM 
              Employee e
          JOIN 
              employee_personal ep ON e.employee_id = ep.employee_id
          WHERE e.status = 'Active'
          ORDER BY 
              e.employee_id
      `;
  try {
            const employeeData = await db.all(query);

      if (employeeData.length === 0) {
          return res.status(404).json({ message: 'No employee records found' });
      }

      // Fields for the CSV file (excluding `photograph` which is a BLOB field)
      const fields = [
          'employee_id', 'first_name', 'last_name', 'gender', 'dob', 'email', 'phone_number', 'education_level',
          'hire_date', 'employee_type', 'job_title', 'designation', 'salary', 'department', 'manager',
          'effective_date', 'joining_date', 'resignation_date', 'relieving_date', 'status', 'remarks',
          'personal_email', 'religion', 'mother_tongue', 'educational_background', 'hobbies', 'anniversary_date',
          'special_certifications', 'current_residential_address', 'permanent_residential_address', 'marital_status',
          'spouse_name', 'children', 'emergency_contact', 'relation_with_contact', 'blood_type', 'cv', 'aadhar_card',
          'location', 'pan_number', 'pan_card', 'address_proof', 'passport_copy', 'relevant_certificates',
          'special_certificates', 'voter_id'
      ];

      const opts = { fields };

      // Convert data to CSV format
      const parser = new Parser(opts);
      const csv = parser.parse(employeeData);

      // Send the CSV file for download
      res.header('Content-Type', 'text/csv');
      res.attachment('employee_report.csv');
      res.status(200).send(csv);
  } catch (error) {
      console.error('Error generating employee report:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/api/update-photograph/:employeeId', authenticateToken, (req, res) => {
  const { employeeId } = req.params;

  // Assuming you're using multer to handle file uploads
  upload.single('photograph')(req, res, async (err) => {
      if (err) {
          console.error('Error uploading file:', err);
          return res.status(500).json({ error: 'Error uploading file' });
      }

      const photograph = req.file.buffer; // Assuming you're storing the file buffer

      try {
          const query = `UPDATE employee_personal SET photograph = ? WHERE employee_id = ?`;
          await db.run(query, [photograph, employeeId]);
          res.status(200).json({ success: 'Photograph Updated Successfully' });
      } catch (error) {
          console.error('Error updating photograph:', error);
          res.status(500).json({ failure: 'Internal Server Error' });
      }
  });
});

app.put('/api/delete-photograph/:employeeId', authenticateToken, async (req, res) => {
  const { employeeId } = req.params;

  try {
      // Update the employee record to set the photograph to NULL
      const query = `UPDATE employee_personal SET photograph = NULL WHERE employee_id = ?`;
      await db.run(query, [employeeId]);

      res.status(200).json({ success: 'Photograph removed successfully' });
  } catch (error) {
      console.error('Error removing photograph:', error);
      res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.put('/api/update-profile/:employee_id', authenticateToken, async (req, res) => {
  const { employee_id } = req.params;

  const {
      first_name, last_name, gender, dob, email, phone_number, education_level, hire_date, employee_type,
      job_title, designation, salary, department, manager_id, effective_date, joining_date, resignation_date,
      relieving_date, status, remarks, personal_email, religion, mother_tongue, educational_background,
      hobbies, anniversary_date, special_certifications, current_residential_address, permanent_residential_address,
      marital_status, spouse_name, children, emergency_contact, relation_with_contact, blood_type, location,
      pan_number, cv, aadhar_number, aadhar_card,  pan_card, address_proof, passport_copy, relevant_certificates, special_certificates, voter_id
  } = req.body;

  // SQL for updating Employee table
  const updateEmployeeQuery = `
      UPDATE Employee 
      SET first_name = ?, last_name = ?, gender = ?, dob = ?, email = ?, phone_number = ?, 
          education_level = ?, hire_date = ?, employee_type = ?, job_title = ?, designation = ?, 
          salary = ?, department = ?, manager_id = ?, effective_date = ?, joining_date = ?, 
          resignation_date = ?, relieving_date = ?, status = ?, remarks = ?
      WHERE employee_id = ?
  `;

  // SQL for updating employee_personal table
  const updateEmployeePersonalQuery = `
      UPDATE employee_personal 
      SET personal_email = ?, religion = ?, mother_tongue = ?, educational_background = ?, hobbies = ?, 
          anniversary_date = ?, special_certifications = ?, current_residential_address = ?, 
          permanent_residential_address = ?, marital_status = ?, spouse_name = ?, children = ?, 
          emergency_contact = ?, relation_with_contact = ?, blood_type = ?, cv = ?, aadhar_number = ?,
          aadhar_card = ?, location = ?, pan_number = ?, pan_card = ?, address_proof = ?, passport_copy = ?,
          relevant_certificates = ?, special_certificates = ?, voter_id = ?
      WHERE employee_id = ?
  `;

  try{
    await db.run(updateEmployeeQuery, 
      [first_name, last_name, gender, dob, email, phone_number, education_level, hire_date, employee_type,
      job_title, designation, salary, department, manager_id, effective_date, joining_date, resignation_date,
      relieving_date, status, remarks, employee_id]
    )

    await db.run(updateEmployeePersonalQuery, [
      personal_email, religion, mother_tongue, educational_background, hobbies, anniversary_date, 
      special_certifications, current_residential_address, permanent_residential_address, marital_status, 
      spouse_name, children, emergency_contact, relation_with_contact, blood_type, cv, aadhar_number, aadhar_card, 
      location, pan_number, pan_card, address_proof, passport_copy, relevant_certificates, special_certificates,
      voter_id, employee_id
  ])

  res.status(200).json({ success: `Your Profile Updated Successfully` });

  }catch (err){
    console.error('Error updating profile:', err);
    res.status(500).json({ failure: 'Internal Server Error' });
  } 

});

app.put('/api/update-employee/:employee_id', authenticateToken, async (req, res) => {
  const { employee_id } = req.params;
  
  const {
    role_name, first_name, last_name, gender, dob, email,
    phone_number, education_level, hire_date, employee_type,
    job_title, designation, salary, department, manager_id, effective_date,
    joining_date, resignation_date, relieving_date, status, remarks,
    personal_email, religion, mother_tongue, educational_background,
    hobbies, anniversary_date, special_certifications, current_residential_address, 
    permanent_residential_address, marital_status, spouse_name, children, 
    emergency_contact, relation_with_contact, blood_type, cv, aadhar_number,
    aadhar_card, location, pan_number, pan_card, address_proof, passport_copy, 
    relevant_certificates, special_certificates, voter_id

  } = req.body;

  const roleMap = {
    'SUPER ADMIN': 1,
    'HR ADMIN': 2,
    'FINANCE ADMIN': 3,
    'USER': 4
  };
  
  const roleId = roleMap[role_name] || '';

  const updateEmployeeQuery = `
      UPDATE Employee 
SET first_name = ?, 
    last_name = ?, 
    gender = ?, 
    dob = ?, 
    email = ?, 
    phone_number = ?, 
    education_level = ?, 
    hire_date = ?, 
    employee_type = ?, 
    job_title = ?, 
    designation = ?, 
    salary = ?, 
    department = ?, 
    manager_id = ?, 
    effective_date = ?, 
    joining_date = ?, 
    resignation_date = ?, 
    relieving_date = ?, 
    status = ?, 
    remarks = ?
WHERE employee_id = ?`
;

const updateEmployeePersonalQuery = `
UPDATE employee_personal
SET personal_email = ?, 
    religion = ?, 
    mother_tongue = ?, 
    educational_background = ?, 
    hobbies = ?, 
    anniversary_date = ?, 
    special_certifications = ?, 
    current_residential_address = ?, 
    permanent_residential_address = ?, 
    marital_status = ?, 
    spouse_name = ?, 
    children = ?, 
    emergency_contact = ?, 
    relation_with_contact = ?, 
    blood_type = ?, 
    cv = ?, 
    aadhar_number = ?,
    aadhar_card = ?, 
    location = ?, 
    pan_number = ?, 
    pan_card = ?, 
    address_proof = ?, 
    passport_copy = ?, 
    relevant_certificates = ?, 
    special_certificates = ?, 
    voter_id = ?
WHERE employee_id = ?
`;

  const updateRoleQuery = `UPDATE employee_role
                           SET role_id = ?
                           WHERE employee_id = ?`

  try{
    await db.run(updateEmployeeQuery, 
      [ first_name, last_name, gender, dob, 
        email, phone_number, education_level, hire_date, 
        employee_type, job_title, designation, salary, department, 
        manager_id, effective_date, joining_date, resignation_date, 
        relieving_date, status, remarks, employee_id ]
    )

    await db.run(updateEmployeePersonalQuery, [
      personal_email, religion, mother_tongue, educational_background, hobbies, anniversary_date, 
      special_certifications, current_residential_address, permanent_residential_address, marital_status, 
      spouse_name, children, emergency_contact, relation_with_contact, blood_type, cv, aadhar_number, aadhar_card,
      location, pan_number, pan_card, address_proof, passport_copy, relevant_certificates, special_certificates,
      voter_id, employee_id
  ])

    await db.run(updateRoleQuery, [roleId, employee_id])

  res.status(200).json({ success: `Saved Changes for ${employee_id}` });

  }catch (err){
    console.error('Error updating employee details:', err);
    res.status(500).json({ failure: 'Internal Server Error' });
  } 

});

app.put('/api/update-employee-status/:employee_id', authenticateToken, async (req, res) => {
  const { employee_id } = req.params;
  const { status } = req.body;

  const updateQuery = `UPDATE employee SET status = ? WHERE employee_id = ?`;

  try {
    await db.run(updateQuery, [status, employee_id]);
      res.status(200).json({ success: `${employee_id} status updated to ${status}` });
  } catch (err) {
    console.error('Error updating employee status:', err);
    res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.get('/api/employee-leave-requests',authenticateToken, async (req, res) => {

  const query = `SELECT l.leave_id, e.employee_id, e.first_name || ' ' || e.last_name as name, e.designation,
                  l.leave_type, l.start_date, l.end_date, l.leave_reason, l.leave_status, l.applied_date
                  FROM leave_requests l
                  JOIN employee e ON l.employee_id = e.employee_id
                  WHERE l.end_date >= date('now')
                  ORDER BY 
                  l.applied_date DESC
  `;
  try{
    const data = await db.all(query)
    res.status(200).json(data)
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.put('/api/update-leave-status/:leaveId', authenticateToken, async (req, res) => {
  const { status, leaveRequest } = req.body;
  const { leaveId } = req.params;

  const updateLeaveQuery = `UPDATE leave_requests
                            SET leave_status = '${status}'
                            WHERE leave_id = ${leaveId}`;

  try {
    await db.run(updateLeaveQuery);
    
    if (status === 'Approved') {
      const { employee_id, start_date, end_date } = leaveRequest;
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        const formattedDate = format(d, 'yyyy-MM-dd'); 

        const insertAttendanceQuery = `
          INSERT INTO attendance (employee_id, date, status)
          VALUES ('${employee_id}', '${formattedDate}', 'L')
        `;

        await db.run(insertAttendanceQuery);
      }
    }

    const query = `
    SELECT e.email as employee_email, ee.email as manager_email, 
    l.leave_type, l.start_date, l.end_date FROM leave_requests l
    JOIN employee e ON l.employee_id = e.employee_id
    JOIN employee ee ON e.manager_id = ee.employee_id
    WHERE l.leave_id = ?;
    `;

    const {employee_email, manager_email, leave_type, start_date, end_date} = await db.get(query, [leaveId])

    const textTemplate = `
    Your ${leave_type} leave got ${status}

    Leave Type: ${leave_type}

    Start Date: ${start_date}

    End Date: ${end_date}
    `;
    
    const mailOptions = {
      from: process.env.OUTLOOK_USER,
      to: employee_email,
      cc: manager_email,
      subject: `Your ${leave_type} leave status`,
      text: textTemplate,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent`);
    } catch (error) {
      console.error(`Error sending email:`, error);
    }

    res.status(200).json({ success: `Leave ${status}` });
  } catch (err) {
    console.error('Error updating leave status:', err);
    res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.get('/api/attendance', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;

  // Default to last 7 days if no date range is provided
  const defaultStartDate = "date('now', '-6 days')";
  const defaultEndDate = "date('now')";

  const query = `
      SELECT 
          e.employee_id AS employeeId, 
          e.first_name || ' ' || e.last_name AS employeeName,
          e.department,
          a.date AS date,
          a.login_time AS loginTime,
          a.logout_time AS logoutTime,
          a.status AS status
      FROM 
          employee e
      LEFT JOIN 
          attendance a ON e.employee_id = a.employee_id
      WHERE
          e.status = 'Active'
          AND 
          a.date >= ${startDate ? `'${startDate}'` : defaultStartDate}
      AND
          a.date <= ${endDate ? `'${endDate}'` : defaultEndDate}
      ORDER BY 
          e.employee_id, a.date DESC;
  `;

  try {
    const rows = await db.all(query);
    const attendanceData = rows.reduce((acc, row) => {
        const { employeeId, employeeName, department, date, status, loginTime, logoutTime } = row;
        let employee = acc.find(e => e.employeeId === employeeId);
        if (!employee) {
            employee = {
                employeeId,
                employeeName,
                department,
                attendance: []
            };
            acc.push(employee);
        }
        // Push login_time and logout_time in addition to date and status
        employee.attendance.push({ date, status, loginTime, logoutTime });
        return acc;
    }, []);

    res.status(200).json(attendanceData);

  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/attendance/:employeeId', authenticateToken, async (req, res) => {
  const { employeeId } = req.params;
  const currentDate = format(new Date(), 'yyyy-MM-dd');

  try {
    const query = `SELECT * FROM attendance WHERE employee_id = ? AND date = ?`;
    const attendance = await db.get(query, [employeeId, currentDate]);

    if (attendance) {
      res.status(200).json(attendance);
    } else {
      res.status(404).json({ failure: 'No attendance record found for today.' });
    }
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ failure: 'Error fetching attendance.' });
  }
});

app.post('/api/attendance/login', authenticateToken, async (req, res) => {
  const { employeeId } = req.body;
  const currentDate = format(new Date(), 'yyyy-MM-dd');

  const options = {
    timeZone: 'Asia/Kolkata', // IST time zone
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
};
const loginTime = new Date().toLocaleTimeString('en-US', options);
  const insertQuery = `
        INSERT INTO attendance (employee_id, date, login_time, status)
        VALUES (?, ?, ?, 'P')
      `;

  try {
      await db.run(insertQuery, [employeeId, currentDate, loginTime]);
      res.status(201).json({ success: 'Login time recorded' });

  } catch (error) {
    console.error('Error recording login time:', error);
    res.status(500).json({ failure: 'Failed to record login time.' });
  }
});

app.post('/api/attendance/logout', authenticateToken, async (req, res) => {
  const { employeeId } = req.body;
  const currentDate = format(new Date(), 'yyyy-MM-dd');

  const options = {
    timeZone: 'Asia/Kolkata', // IST time zone
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  const logoutTime = new Date().toLocaleTimeString('en-US', options);

  const updateQuery = `
        UPDATE attendance
        SET logout_time = ?
        WHERE employee_id = ? and date = ?
      `;

  try {
    await db.run(updateQuery, [logoutTime, employeeId, currentDate]);
    res.status(201).json({ success: 'Logout time recorded' });

  } catch (error) {
    console.error('Error recording logout time:', error);
    res.status(500).json({ failure: 'Failed to record logout time.' });
  }
});

app.get('/api/user-attendance/:employeeId', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const { employeeId } = req.params;

  // Default to last 7 days if no date range is provided
  const defaultStartDate = "date('now', '-6 days')";
  const defaultEndDate = "date('now')";

  const query = `
      SELECT 
          a.date,
          a.status,
          a.login_time AS loginTime,
          a.logout_time AS logoutTime
      FROM 
          attendance a 
      WHERE 
          a.employee_id = '${employeeId}' 
          AND a.date >= ${startDate ? `'${startDate}'` : defaultStartDate}
          AND a.date <= ${endDate ? `'${endDate}'` : defaultEndDate}
      ORDER BY 
          a.date DESC;
  `;

  try {
    const rows = await db.all(query);
    const employee = { attendance: [] };

    const attendanceData = rows.reduce((acc, row) => {
      const { date, status, loginTime, logoutTime } = row;

      // Add the employee attendance record with login/logout times
      employee.attendance.push({ date, status, loginTime, logoutTime });
      
      return acc;
    }, []);

    // Return employee attendance data
    res.status(200).json([employee]);

  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/apply-leave', authenticateToken, async (req, res) => {
  const { employeeId, leaveType, startDate, endDate, leaveReason } = req.body;

  const start = new Date(startDate);
  const startMonth = start.getMonth() + 1; 
  const startYear = start.getFullYear();

  const nonMedicalLeaves = `
  SELECT 
    SUM(julianday(end_date) - julianday(start_date) + 1) AS totalDays
  FROM leave_requests
  WHERE employee_id = ?
    AND leave_type <> 'Medical'
    AND leave_status = 'Approved'
    AND CAST(strftime('%m', start_date) AS INTEGER) = ?
    AND CAST(strftime('%Y', start_date) AS INTEGER) = ?
`;

  const insertQuery = `
    INSERT INTO leave_requests(employee_id, leave_type, start_date, end_date, leave_reason)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const result = await db.get(nonMedicalLeaves, [employeeId, startMonth, startYear]);
    const totalDays = result.totalDays || 0; 

    // Calculate the number of days being requested for the new leave
    const requestedLeaveDays = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 3600 * 24)) + 1;

    // Check if the total leave days (existing + requested) exceed the 2-day limit
    if (leaveType !== 'Medical'){
      if (totalDays >= 2) {
        return res.status(400).json({ failure: 'Your leave balance has been exhausted. Please get in touch with your Manager.' });
      }
      else if (totalDays + requestedLeaveDays > 2) {
        return res.status(400).json({ failure: 'Your remaining leave balance is only one day.' });
      }
    }
    
    // If the limit is not exceeded, proceed to insert the leave request
    await db.run(insertQuery, [employeeId, leaveType, startDate, endDate, leaveReason]);
    
    const mailsQuery = `
    SELECT e.email AS employee_email, ee.email AS manager_email
    FROM employee e
    JOIN employee ee ON e.manager_id = ee.employee_id
    WHERE e.employee_id = 'TM002';
    `;

    const {employee_email, manager_email} = await db.get(mailsQuery)

    const textTemplate = `
    Leave Type: ${leaveType}

    Start Date: ${startDate}

    End Date: ${endDate}

    Reason: ${leaveReason}
    `;
    
    const mailOptions = {
      from: process.env.OUTLOOK_USER,
      to: manager_email,
      subject: `${employeeId} has applied for ${leaveType} leave`,
      text: textTemplate,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent`);
    } catch (error) {
      console.error(`Error sending email:`, error);
    }

    return res.status(200).json({ success: 'Leave requested successfully' });

  } catch (err) {
    console.error('Error leave requesting:', err);
    return res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.get('/api/leave-requests', authenticateToken, async (req, res) => {
  const {employeeId} = req.query;

  const query = `SELECT leave_type, start_date, end_date, leave_reason, leave_status, applied_date
                  FROM leave_requests
                  WHERE employee_id = '${employeeId}' and end_date >= date('now')
                  ORDER BY 
                  applied_date DESC
  `;
  try{
    const rows = await db.all(query)
    res.status(200).json(rows)
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/attendance-report', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = `
  SELECT 
      a.employee_id, a.date, a.status, a.login_time, a.logout_time 
  FROM 
      attendance a
  JOIN employee e ON a.employee_id = e.employee_id 
  WHERE 
      e.status = 'Active'
      AND
      a.date BETWEEN ? AND ?
  ORDER BY 
      a.employee_id, a.date
  `;

  try {
      // Fetch attendance data for the given range
      const attendanceData = await db.all(query, [startDate, endDate]);

      if (attendanceData.length === 0) {
          return res.status(404).json({ failure: 'No attendance records found' });
      }

      // Get all unique employee IDs
      const employees = [...new Set(attendanceData.map(record => record.employee_id))];

      // Generate date range from startDate to endDate
      const dateRange = [];
      let currentDate = moment(startDate);
      const lastDate = moment(endDate);
      while (currentDate.isSameOrBefore(lastDate)) {
          dateRange.push(currentDate.format('YYYY-MM-DD'));
          currentDate.add(1, 'days');
      }
  
      const reportData = employees.map(employeeId => {
          const record = { employee_id: employeeId };

          // Add attendance status for each date in the range
          dateRange.forEach(date => {
              const attendance = attendanceData.find(
                  record => record.employee_id === employeeId && record.date === date
              );

              if (attendance) {
                  const { status, login_time, logout_time } = attendance;

                  // Format the time info if the employee is marked present (P)
                  if (status === 'P') {
                      record[date] = `${status}, ${login_time || 'No Login'} - ${logout_time || 'No Logout'}`;
                  } else {
                      record[date] = status;
                  }
              } else {
                  // Default to '-' if no record found
                  record[date] = '-';
              }
          });

          return record;
      });

      // Define CSV fields (employee_id + date range as columns)
      const fields = ['employee_id', ...dateRange];
      const opts = { fields };

      // Convert report data to CSV
      const parser = new Parser(opts);
      const csv = parser.parse(reportData);

      // Send the CSV file for download
      res.header('Content-Type', 'text/csv');
      res.attachment(`attendance_report_${startDate}_to_${endDate}.csv`);
      res.status(200).send(csv);
  } catch (error) {
      console.error('Error generating attendance report:', error);
      res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.get('/api/payroll', authenticateToken,async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: 'Month is required' });
  }

  const query = `
    SELECT 
      p.employee_id AS employeeId, 
      e.first_name || ' ' || e.last_name AS employeeName,
      e.department AS department, 
      e.designation AS designation, 
      e.email AS email, 
      p.payroll_id,
      p.payment_mode AS paymentMode,
      p.bank_name AS bankName,
      p.account_number AS accountNumber,
      p.payment_date AS paymentDate,
      p.pay_period AS payPeriod,
      p.net_salary AS netSalary
    FROM Payroll p
    JOIN Employee e ON p.employee_id = e.employee_id
    WHERE p.pay_period = ?
    ORDER BY e.employee_id
  `;

  try{
    const data = await db.all(query, [month]);
    res.status(200).json(data)

  } catch(err){
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/upload-attendance', authenticateToken, async (req, res) => {
  const attendanceData = req.body;

  const uploadAttendanceQuery = `
              INSERT INTO Attendance (
                  employee_id, date, login_time, logout_time, status, remarks
              ) VALUES (?, ?, ?, ?, ?, ?)
          `;

  try{
    for (const row of attendanceData.rows){
      const values = row.values;

      const data = [
        values.employee_id ? values.employee_id.trim() : null,
        values.date ? values.date.trim() : null,
        values.login_time ? values.login_time.trim() : null,
        values.logout_time ? values.logout_time.trim() : null,
        values.status ? values.status.trim() : null,
        values.remarks ? values.remarks.trim() : null
      ];

      await db.run(uploadAttendanceQuery, data);
    }
    res.status(201).json({ success: 'Attendance Imported Successfully' });
  } catch (err) {
    console.error('Error inserting payroll data:', err);
    res.status(500).json({ failure: 'Internal Server Error' });
  }
  });

app.post('/api/upload-payroll', authenticateToken, async (req, res) => {
  const payrollData = req.body;

  const uploadPayrollQuery = `
    INSERT INTO Payroll (
      employee_id, bank_name, account_number, payment_mode, payment_date,
      pay_period, basic, hra, conveyance, medical, lta, special_allowance, other_allowance,
      variable_pay, incentive, food_allowance, dress_allowance, telephone_internet,
      newspaper_periodicals, total_deductions, pf_number, pf, pt, income_tax, others, loan,
      insurance, esi, level, tax_regime, gross_salary, net_salary, payslip_attachment, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const isValidPayPeriod = (pay_period) => {
    const regex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;
    return regex.test(pay_period);
  }

  try {
      // Start transaction
      await db.run('BEGIN TRANSACTION');

      for (const row of payrollData.rows) {
          const values = row.values;

          // Validate pay_period
          if (!isValidPayPeriod(values.pay_period)) {
              throw new Error('Invalid Pay Period. Format should be Short Month Format (e.g., Jan 2024)');
          }

          const employeeDetailsQuery = `
              SELECT e.first_name || ' ' || e.last_name as name, e.designation, e.joining_date, ep.location, ep.pan_number
              FROM employee e 
              JOIN employee_personal ep ON e.employee_id = ep.employee_id
              WHERE e.employee_id = ?
          `;

          const employeeDetails = await db.get(employeeDetailsQuery, [values.employee_id.trim()]);
          if (!employeeDetails) {
              throw new Error(`Employee not found for employee_id: ${values.employee_id.trim()}`);
          }

          // Set other values based on employee details
          values.name = employeeDetails.name;
          values.designation = employeeDetails.designation || '-';
          values.joining_date = employeeDetails.joining_date || '-';
          values.amount_in_words = capitalizeFirstLetter(numberToWords.toWords(parseFloat(values.net_salary || 0)));
          values.location = employeeDetails.location || '-';
          values.pan_number = employeeDetails.pan_number || '-';

          const data = [
              values.employee_id ? values.employee_id.trim() : null,
              values.bank_name ? values.bank_name.trim() : null,
              values.account_number ? values.account_number.trim() : null,
              values.payment_mode ? values.payment_mode.trim() : null,
              values.payment_date ? values.payment_date.trim() : null,
              values.pay_period ? values.pay_period.trim() : null,
              values.basic ? values.basic.trim() : null,
              values.hra ? values.hra.trim() : null,
              values.conveyance ? values.conveyance.trim() : null,
              values.medical ? values.medical.trim() : null,
              values.lta ? values.lta.trim() : null,
              values.special_allowance ? values.special_allowance.trim() : null,
              values.other_allowance ? values.other_allowance.trim() : null,
              values.variable_pay ? values.variable_pay.trim() : null,
              values.incentive ? values.incentive.trim() : null,
              values.food_allowance ? values.food_allowance.trim() : null,
              values.dress_allowance ? values.dress_allowance.trim() : null,
              values.telephone_internet ? values.telephone_internet.trim() : null,
              values.newspaper_periodicals ? values.newspaper_periodicals.trim() : null,
              values.total_deductions ? values.total_deductions.trim() : null,
              values.pf_number ? values.pf_number.trim() : null,
              values.pf ? values.pf.trim() : null,
              values.pt ? values.pt.trim() : null,
              values.income_tax ? values.income_tax.trim() : null,
              values.others ? values.others.trim() : null,
              values.loan ? values.loan.trim() : null,
              values.insurance ? values.insurance.trim() : null,
              values.esi ? values.esi.trim() : null,
              values.level ? values.level.trim() : null,
              values.tax_regime ? values.tax_regime.trim() : null,
              values.gross_salary ? values.gross_salary.trim() : null,
              values.net_salary ? values.net_salary.trim() : null,
              null,
              values.remarks ? values.remarks.trim() : null
          ];

          // Generate payslip PDF and attach
          const htmlTemplate = fs.readFileSync(path.join(__dirname, 'payslip_template.html'), 'utf8');
          const renderedHtml = htmlTemplate.replace(/{{\s*([^\s]+)\s*}}/g, (_, key) => values[key.trim()]);
          const pdfBuffer = await new Promise((resolve, reject) => {
              pdf.create(renderedHtml).toBuffer((err, buffer) => {
                  if (err) return reject(err);
                  resolve(buffer);
              });
          });

          data[data.length - 2] = pdfBuffer;

          // Insert data into Payroll table
          await db.run(uploadPayrollQuery, data);
      }

      // If everything is successful, commit the transaction
      await db.run('COMMIT');
      res.status(201).json({ success: 'Payroll Imported Successfully' });
  } catch (err) {
      console.error('Error inserting payroll data:', err);
      await db.run('ROLLBACK');
      res.status(500).json({ failure: err.message });
  }
});

  app.get('/api/payslip/:payroll_id', authenticateToken, async (req, res) => {
    const { payroll_id } = req.params;
    
    try {
        const query = 'SELECT payslip_attachment FROM Payroll WHERE payroll_id = ?';
        const row = await db.get(query, [payroll_id]);

        if (row && row.payslip_attachment) {
            // Set the content type and disposition headers to display the PDF in the browser
            res.contentType('application/pdf');
            res.setHeader('Content-Disposition', 'inline'); // 'inline' ensures the PDF is displayed in the browser

            res.send(row.payslip_attachment);
        } else {
            res.status(404).send('Payslip not found');
        }
    } catch (error) {
        console.error('Error fetching payslip:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/user-payroll/:employeeId', authenticateToken, async (req, res) => {
  const {employeeId} = req.params
  const {month} = req.query

  const query = `SELECT 
                  p.payroll_id,
                  p.payment_mode,
                  p.bank_name,
                  p.account_number,
                  p.payment_date,
                  p.pay_period,
                  p.net_salary
                FROM Payroll p
                WHERE p.pay_period = ? AND p.employee_id = ?`;
  
  try{
    const data = await db.all(query, [month, employeeId])
    res.status(200).json(data)
  }catch (err) {
    console.log(err)
  }
});

app.get('/api/trainings', authenticateToken, async (req, res) => {
  const query = `SELECT * FROM training
                 ORDER BY training_id DESC
                 `;

  try{
    const data = await db.all(query);
    res.status(200).json(data)
  } catch (err) {
    res.status(500).send('Internal Server Error')
    console.log(err)
  }
})

app.get('/api/user-trainings/:employeeId', authenticateToken, async (req, res) => {
  const {employeeId} = req.params

  const query = `SELECT * FROM training t
                 JOIN employee_training et ON t.training_id = et.training_id
                 WHERE et.employee_id = ?
                 ORDER BY training_id DESC
                 `;

  try{
    const data = await db.all(query, [employeeId]);
    res.status(200).json(data)
  } catch (err) {
    res.status(500).send('Internal Server Error')
    console.log(err)
  }
})

app.post('/api/add-training', authenticateToken, async (req, res) => {
  const {subject, startDate, endDate, trainer, hours, method, remarks} = req.body

  const query = `INSERT INTO training(training_subject, start_date, end_date, trainer_name, training_hours, training_method, remarks)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

  try{
    await db.run(query, [subject, startDate, endDate, trainer, hours, method, remarks])
    res.status(200).json({success: `Added ${subject} training Successfully`})
  } catch(err) {
    res.status(500).json({ failure: "Internal Server Error" });
    console.log(err)
  }

});

app.get('/api/training/:trainingId', authenticateToken, async (req, res) => {
  const { trainingId } = req.params;

  const trainingQuery = `
    SELECT *
    FROM training
    WHERE training_id = ?`;

  const employeesQuery = `
    SELECT e.employee_id, e.first_name || ' ' || e.last_name as name, e.designation, e.email,
    et.status
    FROM employee_training et
    JOIN employee e ON et.employee_id = e.employee_id
    WHERE et.training_id = ?`;

  try {
    const trainingDetails = await db.get(trainingQuery, [trainingId])

    if (!trainingDetails) {
      return res.status(404).json({ failure: 'Training not found' });
    }

    const registeredEmployees = await db.all(employeesQuery, [trainingId])

    res.status(200).json({
      trainingDetails: trainingDetails,
      registeredEmployees: registeredEmployees,
    });

  } catch (err) {
    console.error('Error fetching training details:', err);
    res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.put('/api/update-training/:trainingId', authenticateToken, async (req, res) => {
  const { trainingId } = req.params;
  const { training_subject, start_date, end_date, trainer_name, training_hours, training_method, progress_status, active_status, remarks } = req.body;

  const query = `UPDATE training SET 
                  training_subject = ?, 
                  start_date = ?, 
                  end_date = ?, 
                  trainer_name = ?, 
                  training_hours = ?, 
                  training_method = ?, 
                  progress_status = ?, 
                  active_status = ?,
                  remarks = ?
                  WHERE training_id = ?`;

  try {
      await db.run(query, [training_subject, start_date, end_date, trainer_name, training_hours, training_method, progress_status, active_status, remarks, trainingId]);
      res.status(200).json({ success: `Saved Changes for ${training_subject}` });
  } catch (err) {
      res.status(500).json({ failure: 'Failed to Save Changes' });
  }
});

app.post("/api/training/:trainingId/register-employees", authenticateToken, async (req, res) => {
  const { trainingId } = req.params;
  const  employees  = req.body;

  try {
      for (let employee of employees.rows) {
          const { employee_id } = employee.values;
          // Insert into the employee_training table
          await db.run(
              `INSERT INTO employee_training (employee_id, training_id) VALUES (?, ?)`,
              [employee_id, trainingId]
          );
      }

  res.status(200).json({ success: "Employee(s) Registered Successfully!" });
  } catch (error) {
      console.error("Error adding employees:", error);
      res.status(500).json({ failure: "Failed to Register Employees" });
  }
});

app.put('/api/update-training-status/:training_id', authenticateToken, async (req, res) => {
  const { training_id } = req.params;
  const { status } = req.body;

  const updateQuery = `UPDATE training SET active_status = ? WHERE training_id = ?`;

  try {
    await db.run(updateQuery, [status, training_id]);
      res.status(200).json({ success: `Status Updated to ${status}` });
  } catch (err) {
    console.error('Error updating traininig status:', err);
      res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.put('/api/update-employee-training-status/:training_id', authenticateToken, async (req, res) => {
  const {training_id} = req.params
  const { employee_id, status } = req.body;

  const updateQuery = `UPDATE employee_training SET status = ? 
                       WHERE training_id = ? AND employee_id = ?`;

  try {
    await db.run(updateQuery, [status, training_id, employee_id]);
      res.status(200).json({ success: `Status Updated to ${status}` });
  } catch (err) {
    console.error('Error updating traininig status:', err);
      res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.get('/api/training-report', authenticateToken, async (req, res) => {
  try {
      // Query to fetch training details along with registered employees
      const query = `
          SELECT 
              t.training_subject, t.start_date, t.end_date, t.trainer_name, 
              t.training_hours, t.training_method, t.progress_status, t.remarks, 
              GROUP_CONCAT(et.employee_id) AS registered_employees
          FROM 
              training t
          LEFT JOIN 
              employee_training et ON t.training_id = et.training_id
          WHERE t.active_status = 'Active'
          GROUP BY 
              t.training_id
      `;

      // Fetch data from the database
      const trainingData = await db.all(query);

      if (trainingData.length === 0) {
          return res.status(404).json({ message: 'No training records found' });
      }

      // Fields for the CSV file
      const fields = [
        { label: 'Subject', value: 'training_subject' },
        { label: 'Start Date', value: 'start_date' },
        { label: 'End Date', value: 'end_date' },
        { label: 'Trainer', value: 'trainer_name' },
        { label: 'Hours', value: 'training_hours' },
        { label: 'Method', value: 'training_method' },
        { label: 'Progress', value: 'progress_status' },
        { label: 'Remarks', value: 'remarks' },
        { label: 'Registered Employees', value: 'registered_employees' },
    ];

      const opts = { fields };

      // Convert data to CSV format
      const parser = new Parser(opts);
      const csv = parser.parse(trainingData);

      // Send the CSV file for download
      res.header('Content-Type', 'text/csv');
      res.attachment('training_report.csv');
      res.status(200).send(csv);
  } catch (error) {
      console.error('Error generating training report:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/cv', authenticateToken, async (req, res) => {
  const query = `SELECT * FROM cv_database`

  try{
    const data = await db.all(query)
    res.status(200).json(data)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

app.post('/api/upload-cv', authenticateToken, async (req, res) => {
  const cvs = req.body; 

  const cvInsertQuery = `
    INSERT INTO cv_database (
      name, post_applied, phone_no, email_id, experience
    ) VALUES (?, ?, ?, ?, ?)
  `;

  try {
    for (const row of cvs.rows) {
      const values = row.values; 

      const cvData = [
        values.name ? values.name.trim() : null,
        values.post_applied ? values.post_applied.trim() : null,
        values.phone_no ? values.phone_no.trim() : null,
        values.email_id ? values.email_id.trim() : null,
        values.experience ? values.experience.trim() : null,
      ];

      await db.run(cvInsertQuery, cvData)
    }

    res.status(201).json({success: 'Candidates Uploaded Successfully'});
  } catch (err) {
    console.error('Error uploading CV data:', err);
    res.status(500).json({ failure: 'Internal Server Error' });
  }
});

app.put('/api/update-candidate-status/:candidate_id', authenticateToken, async (req, res) => {
  const { candidate_id } = req.params;
  const { status } = req.body;

  const updateQuery = `UPDATE cv_database SET active_status = ? WHERE candidate_id = ?`;

  try {
    await db.run(updateQuery, [status, candidate_id]);
    res.status(200).json({success: `Status Updated to ${status}`});
  } catch (err) {
    console.error('Error updating traininig status:', err);
    res.status(500).json({failure: `Internal Server Error`});
  }
});

app.get('/api/cv/:candidate_id', authenticateToken, async (req, res) => {
  const { candidate_id } = req.params;

  const query = `
    SELECT *
    FROM cv_database
    WHERE candidate_id = ?`;

  try {
    const data = await db.get(query, [candidate_id])

    if (!data) {
      return res.status(404).json({ error: 'Candidate Not Found' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching training details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/update-cv/:candidate_id', authenticateToken, async (req, res) => {
  const { candidate_id } = req.params;
  const {
    name,
    post_applied,
    gender,
    dob,
    highest_qualification,
    university,
    contact_address,
    current_position,
    phone_no,
    email_id,
    linkedin,
    languages_familiar,
    experience,
    accomplishments,
    other_details,
    source,
    date_received,
    samples_attached,
    cv_attachment,
    shortlisted_for_future,
    date_shortlisted,
    status,
    standard_hr_mail_sent,
    active_status,
    remarks
  } = req.body;

  const query = `UPDATE cv_database SET 
                  name = ?, 
                  post_applied = ?, 
                  gender = ?, 
                  dob = ?, 
                  highest_qualification = ?, 
                  university = ?, 
                  contact_address = ?, 
                  current_position = ?, 
                  phone_no = ?, 
                  email_id = ?, 
                  linkedin = ?, 
                  languages_familiar = ?, 
                  experience = ?, 
                  accomplishments = ?, 
                  other_details = ?, 
                  source = ?, 
                  date_received = ?, 
                  samples_attached = ?, 
                  cv_attachment = ?, 
                  shortlisted_for_future = ?, 
                  date_shortlisted = ?, 
                  status = ?, 
                  standard_hr_mail_sent = ?, 
                  active_status = ?, 
                  remarks = ?
                  WHERE candidate_id = ?`;

  try {
    await db.run(query, [
      name, post_applied, gender, dob, highest_qualification, university, contact_address,
      current_position, phone_no, email_id, linkedin, languages_familiar, experience, 
      accomplishments, other_details, source, date_received, samples_attached, cv_attachment, 
      shortlisted_for_future, date_shortlisted, status, standard_hr_mail_sent, active_status, remarks, candidate_id
    ]);

    res.status(200).json({ success: 'Saved Changes ' });
  } catch (err) {
    console.error('Error updating CV:', err);
    res.status(500).json({ error: 'Failed to Save Changes' });
  }
});


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

initializeDBAndServer();