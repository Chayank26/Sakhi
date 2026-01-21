function Dashboard(){
 const token=localStorage.getItem('token')
 if(!token){
  return <h3>Unauthorized</h3>
 }
 return <h2>Dashboard</h2>
}
export default Dashboard
