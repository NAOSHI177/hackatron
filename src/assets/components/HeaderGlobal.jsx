import { Link } from "react-router-dom"; 

const HeaderGlobal = () => {
    return (
        <>
            <header>
                <div className="ctnheader-global">    
                    <div className="ctnnavspace-global">
                        <div className="ctnnav-global">
                            <nav className="navctn-global">
                                <h1 className="logo-global">Alpha<span>Agro</span> Space</h1>
                                <ul className="ctnul-global">
                                    <li><Link to='/' className="linkul-global">Home</Link></li>
                                    <li><Link to='/tools' className="linkul-global">Tools</Link></li>
                                    {/* <li><a href="#sobremi" className="linkul">How To Start</a></li>
                                    <li><a href="#sobremi" className="linkul">Tools</a></li>
                                    <li><a href="#sobremi" className="linkul">About Us</a></li> */}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default HeaderGlobal;