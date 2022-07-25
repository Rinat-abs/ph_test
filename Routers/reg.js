const {Router} = require('express');
const User = require('../Models/user');
const ifAuth = require('../middleware/ifAuth');
const auth = require('../middleware/auth');
const {validationResult} = require('express-validator/check');
const user = new User();
const Test = require('../Models/test');
const test = new Test();
const {registerValidators} = require('../utils/validators');
const router = Router();

router.get('/',ifAuth, (req, res) => {
    
    res.render('reg', {
        title: 'Регистрация',
        isReg: true,
        error: req.flash('error'),
        success: req.flash('success'),
        data: {
            iin:'',
            num_ap:'',
            name:'',
            surname:''
        }

    });
});

router.post('/', ifAuth, registerValidators, async (req, res) => {
    const {iin, num_ap, name, surname} = req.body;
    
    
    try
        {
            const errors = validationResult(req);
            if (!errors.isEmpty())
            {
                req.flash('error', errors.array()[0].msg)
                return res.status(422).render('reg', {
                    title: 'Регистрация',
                    isReg: true,
                    error: req.flash('error'),
                    success: req.flash('success'),
                    data: {
                        iin,
                        num_ap,
                        name,
                        surname
                    }
                })
            }
            const settings = await test.getSettings();
            await user.addUser(iin, name, surname, num_ap);
            const user_id = await user.getUserByIIN(iin);
            await user.addTest(iin, user_id.id, 0, settings.id_test_category);
            
            
            req.flash('success', 'Аккаунт успешно создан, <a href="/login" style="    color: #234bbd;" >авторизуйтесь</a>');
            res.redirect('/reg');

            
         
            
        }
        catch(e)
        {
            console.log(e)
            req.flash('error', 'Что-то пошло не так, обратитесь к администратору');
            res.redirect('/reg');
        }
        


});


module.exports = router;