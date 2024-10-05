import { Link } from "react-router-dom"; // Importa Link
 //

const Header = () => {


    return(
        <>
            <header>
                <div className="ctnheader">    
                    <div className="ctnnavspace">
                        <div className="ctnnav">
                            <nav className="navctn">
                                <h1 className="logo"><span>Agro</span> Space</h1>
                                <ul className="ctnul">
                                    <li><Link to='/' className="linkul">Home   </Link></li>
                                    <li><Link to='/tools' className="linkul">Tools</Link></li>
                                    {/* <li><a href="#sobremi" className="linkul">How To Start</a></li>
                                    <li><a href="#sobremi" className="linkul">Tools</a></li>
                                    <li><a href="#sobremi" className="linkul">About Us</a></li> */}
                                </ul>
                            </nav>
                        </div>
                    </div>
                    <div className="ctn-info-text">
                        <div className="ctn-text-main">
                            <h1>
                            Empower Your Crops with Real-Time Weather Insights 
                            </h1>
                            <p>
                            Take control of your fields with up-to-the-minute weather data. Make smarter decisions, maximize your yields, and stay ahead of any climate challenge with our intuitive platform built for agronomists like you.
                            </p>

                        </div>

                    </div>
                </div>
            </header>
        </>
    )
}
export default Header
  