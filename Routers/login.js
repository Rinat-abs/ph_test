const {Router} = require('express');
const ifAuth = require('../middleware/ifAuth');
const auth = require('../middleware/auth');
const User = require('../Models/user');
const userF = new User();
const router = Router();
const {validationResult} = require('express-validator/check');
const {loginValidation} = require('../utils/validators');
router.get('/', ifAuth, (req, res) => {


    res.render('login', {
        title: 'Авторизация',
        isLogin: true,
        error: req.flash('error'),
        data: {
            iin:'',
            surname: ''
        }
    });
});



router.post('/',ifAuth, loginValidation,  async (req, res) => {
    try{
        const {iin, surname} = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            req.flash('error', errors.array()[0].msg)
            return res.status(422).render('login', {
                title: 'Авторизация',
                isLogin: true,
                error: req.flash('error'),
                data: {
                    iin,
                    surname
                }
            })
        }

        
        const user = await userF.getUser(iin, surname);
        if(user)
        {
            req.session.user = user;
            req.session.isAuth = true;
            req.session.save(err => {
                if (err)
                {
                    throw err
                }
                if(user.admin > 0)
                {
                    res.redirect('/admin');
                } else 
                {
                    res.redirect('/test');
                }
                
            })
        } else {
            req.flash('error', 'Неверный логин или пароль, попробуйте ещё раз');
            res.status(422).render('login', {
                title: 'Авторизация',
                isLogin: true,
                error: req.flash('error'),
                data: {
                    iin,
                    surname
                }
            });
        }
        
    }
    catch(err)
    {
        
        console.log(err);
        res.redirect('/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');

    })
});



module.exports = router;