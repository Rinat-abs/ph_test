module.exports = function (req, res, next) 
{
   if (req.session.user.access_level != 'admin')
   {
        return res.redirect('/');
   }  
   next()   
}