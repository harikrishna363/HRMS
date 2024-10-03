import React from 'react'

const AppContext = React.createContext({
  activeMenuId: 'DASHBOARD',
  updateActiveMenuId: () => {},
  userName: '',
  employeeId: '',
})

export default AppContext
