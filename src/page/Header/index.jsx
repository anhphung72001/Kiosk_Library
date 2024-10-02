import logo from "../../assets/images/logo.png"
import './styles.scss'

const Header = () => {
    return (
        <div className="header-app">
            <img src={logo} alt='Logo' height={"80%"} />
            <div className="header-title">Education Library</div>
        </div>
    )
}

export default Header