module.exports = function (req, res, next) 
{
   if (req.session.user.admin != 2)
   {
        return res.redirect('/');
   }  
   next()   
}