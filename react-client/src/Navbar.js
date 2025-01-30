export default function Navbar() {
  return <nav className="nav">
    <a href="/" className="site-title">Data Store</a>
    <ul>
      <li className="active">
        <a href="/map" >Map</a>
      </li>
      <li>
        <a href="/logout">Logout</a>
      </li>
      
    </ul>
  </nav>

}