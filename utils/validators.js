const {body} = require('express-validator/check');
const User = require('../Models/user');
const user = new User();
exports.registerValidators = [
    body('iin').trim().isLength({ min: 12, max:12 })
    .withMessage('Длина ИНН должна составлять 12 цифр'),
    body('iin').isNumeric({no_symbols: true}).withMessage('Введите корректный ИИН').custom(async (value, {req}) => {
        try
        {
        
            if(await user.checkIIN_DB(value))
            {
                return Promise.reject('Данный ИИН занят');
            }
        }
        catch(e)
        {
            console.log(e);
        }
    }),

    body('name').trim().isLength({min: 2}).withMessage('Минимальная длина имени 2 символа').trim().isLength({ max: 15}).withMessage('Максимальная длина имени 15 символов').isAlpha('ru-RU').withMessage('Имя должно быть введено кириллицей'),

    body('surname').trim().isLength({min: 2}).withMessage('Минимальная длина фамилии 2 символа').trim().isLength({ max: 15}).withMessage('Максимальная длина фамилии 25 символов').isAlpha('ru-RU').withMessage('Фамилия должна быть введена кириллицей'),

    body('num_ap').trim().isLength({min: 1}).withMessage('Минимальная длина номера аптеки 1 символ').trim().isLength({ max: 3}).withMessage('Максимальная длина номера аптеки 3 символа')
],
exports.loginValidation = [
    body('iin').trim().isNumeric({no_symbols: true}).withMessage('Введите корректный ИИН')
]