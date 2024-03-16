import Cookies from 'js-cookie';

export async function RedirectToHome(navigate, response) {
  const jwt = await response.data;
  Cookies.set('jwtToken', jwt['access-token'], {
      expires: 7, // 7 jours
  });
  const co = Cookies.get('jwtToken')
  console.log('cookie setted', co);
  navigate("/");
}
