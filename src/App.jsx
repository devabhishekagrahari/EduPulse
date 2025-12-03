
import './App.css'
import ForgetPassword from './screens/Authentications/forgetPassword'
import LoginPage from './screens/Authentications/login'
import SignUp from './screens/Authentications/signUp'
import { BrowserRouter, Routes , Route } from 'react-router-dom'
import HomeScreen from './screens/Dashboard/homescreen'
import BaseLayout from './components/baseLayout'
import GeneratePaper from './screens/Paper/generatePaper'
import { AppProvider } from './context/appProvider'
import AddQuestionForm from './screens/Paper/components/addQuestion'
import { QuestionList }from './screens/Paper/components/QuestionList/QuestionList'
//import { QuestionList }from './screens/Paper/components/questionList'
import ViewPapers from './screens/Paper/paperList'
import AutomatedPaper from './screens/AutomatedPaper/automatedPaper'
import StudentsPerformance from './screens/Students/studentsPerformance'
 
function App() {
  return ( 
  <AppProvider>
  <div className="min-h-screen flex flex-row max-width-full bg-white dark:bg-teal-950 ">
   <BrowserRouter>
   
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/forget-password' element={<ForgetPassword/>}/>
        <Route path='/dashboard' element={<BaseLayout><GeneratePaper/></BaseLayout>}/>
        <Route path='/add-question' element={<BaseLayout><AddQuestionForm/></BaseLayout>}/>
        <Route path='/view-question' element={<BaseLayout><QuestionList mode="full"/></BaseLayout>}/>
        <Route path='/generate-paper' element={<BaseLayout><GeneratePaper/></BaseLayout>}/>
        <Route path='/view-paper' element={<BaseLayout><ViewPapers/></BaseLayout>}/>
        <Route path='/automated-paper' element={<BaseLayout><AutomatedPaper/></BaseLayout>}/>
        <Route path='/students' element={<BaseLayout><StudentsPerformance/></BaseLayout>}/>
      </Routes>
      
    </BrowserRouter>
  </div>  
  </AppProvider>
  )
}

export default App
