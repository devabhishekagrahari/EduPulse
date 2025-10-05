import PasswordForm from "../../components/Forms/fileform";
import LoginForm from "../../components/Forms/logInForm";
import LogoScreen from "../logoScreen";

export default function LoginPage() {
  return (
    <div className="h-screen w-screen flex items-center justif-centre   bg-white ">
      <LogoScreen/>
      <LoginForm />
    </div>
  );
}

