// React
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// others
import Cookies from 'js-cookie';

function AuthGuard({children}) {
  const navigate = useNavigate();
  const jwtToken = Cookies.get('jwtToken');
  let auth = !!jwtToken;
  
  // useEffects
  useEffect(() => {
    if (!auth) {
      console.log('cookie removed', jwtToken);
      Cookies.remove('jwtToken')
      navigate('/portal');
    }
  }, [auth, navigate, jwtToken]);
  
  if (auth)
    return children;
}

export default AuthGuard;