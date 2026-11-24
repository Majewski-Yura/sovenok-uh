export function exactPage(l,w){
 return l.origin==='https://majewski-yura.github.io'&&l.pathname==='/sovenok-uh/v2/enroll-parent.html'&&!l.search&&!l.hash&&w.top===w;
}
export async function verifiedUid(auth,user){
 if(auth.app.options.projectId!=='sovenok-uh'||!user)throw Error('unexpected-project');
 const {claims,signInProvider}=await user.getIdTokenResult();
 if(signInProvider!=='google.com'||claims.email_verified!==true||auth.currentUser!==user||
    typeof user.uid!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(user.uid))throw Error('not-verified');
 return user.uid;
}
