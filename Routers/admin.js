const {Router} = require('express')
const router = Router();
const isAuth = require('../middleware/auth');
const isAdmin = require('../middleware/admin');
const isSuperAdmin = require('../middleware/superAdmin');
const Admin = require('../Models/admin');
const User = require('../Models/user');
const Test = require('../Models/test');
const config = require('../config');

const admin = new Admin();
const user = new User();
const test = new Test();



router.get('/',isAuth, isAdmin, async (req, res) => {
    // await test.checkUserOnCurrentTest(233,2);
    res.render('admin', {
        title: 'Панель адмнистратора',
        isAdmin: true,
        isSuperAdminAdmin: req.session.user.admin,
     
    })
});


router.get('/check_tests',isAuth, isSuperAdmin, async (req, res) => {
   try
   {
        const category = await test.getActualCategory();
        const tests = await admin.getAllActualTestQuestions(category.id);


    
        res.render('admin-check-tests', {
            title: 'Тестовые вопросы',
            isAdmin: true,
            category,
            error: req.flash('error'),
            success: req.flash('success'),
            tests
        })
   } catch(e)
   {
       console.log(e);
       res.redirect('/admin')
   }
});

router.get('/edit_test/:id',isAuth, isSuperAdmin, async (req, res) => {
    try
    {
        const category = await test.getActualCategory();
        const testEdit = await admin.getTestById(req.params.id, category.id)
        
        if(!testEdit)
        {
            res.redirect('/admin/check_tests')
        } else 
        {
            res.render('admin-edit-test', {
                title: 'Тестовые вопросы',
                isAdmin: true,
                testEdit,
                error: req.flash('error'),
                success: req.flash('success'),
            
            });
        }
    } catch(e)
    {
        console.log(e);
        res.redirect('/admin/check_tests');
    }

   
});

router.post('/edit_test',isAuth, isSuperAdmin, async(req, res) => {
    try
    {
        const {test_id, answers, question} = req.body;
        const JSON_answers = JSON.parse(answers.trim());
        if(question.trim().length < 6)
        {
            req.flash('error', 'Слишком короткий вопрос');
            res.redirect('/admin/check_tests')
        } else 
        {
            

            await admin.updateTest(test_id, question.trim(), answers.trim());
            req.flash('success', 'Вопрос успешно изменен');
            res.redirect('/admin/check_tests');
        }
       

    }
    catch(e)
    {
        console.log(e);
        req.flash('error', 'Ошибка введенных данных');
        res.redirect('/admin/check_tests')
    }
});

router.get('/test_permit',isAuth, isAdmin, async (req, res) => {
    try
    {
        const category = await test.getActualCategory();
        const users = await user.getUsertsTestPermit();

    
        res.render('admin-test-permit', {
            title: 'Панель адмнистратора',
            isAdmin: true,
            category,
            error: req.flash('error'),
            success: req.flash('success'),
            users
        });
    } catch(e)
    {
        console.log(e);
        res.redirect('/admin')
    }
});

router.post('/test_permit',isAuth, isAdmin, async (req, res) => {
   
    try
    {
        const category = await test.getActualCategory();
        const {user_id} = req.body;
        const users = await user.getUsertsTestPermit();
        const ActualUser = await user.geetUserById(user_id);

        if(!ActualUser)
        {
            req.flash('error', 'Пользователь не найдет');
            res.redirect('/admin/test_permit');
            
        }
        let checkUser = 0;
        for(let i = 0; i < users.length; i++)
        {
            if(users[i].id == user_id)
            {
                checkUser = 1;
                break;
            }
        }
        if(checkUser)
        {   
            await user.addTest(ActualUser.iin, ActualUser.id, 0, category.id);
            req.flash('success', `Доступ  выдан "${ActualUser.surname} ${ActualUser.name}"`)
            res.redirect('/admin/test_permit');
        } else 
        {
            req.flash('error', `"${ActualUser.surname} ${ActualUser.name}" не может получить доступ`);
            res.redirect('/admin/test_permit');
        }
    }
    catch(e)
    {
        req.flash('error', `Ошибка! Обратитесь к администратору`);
        res.redirect('/admin/test_permit');
        console.log(e)

    }

  
    
});


router.get('/settings',isAuth, isSuperAdmin, async (req, res) => {
    try
    {
        const settings = await test.getSettings();
        const test_category = await admin.getActulTestCategory();
        if(!test_category)
        {
            res.redirect('/admin')
        } 
        else 
        {
            res.render('admin-settings', {
                title: 'Настройки',
                isAdmin: true,
                settings,
                test_category,
                error: req.flash('error'),
                success: req.flash('success'),
                
            })
        }
    } catch(e)
    {
        console.log(e)
        res.redirect('/admin')
    }
   
});

router.post('/settings-save',isAuth, isSuperAdmin, async (req, res) => {
    
    try
    {
        const {test_time, test_count} = req.body;
        await test.updateSettings(test_time, test_count);
        req.flash('success', 'Данные успешно сохранены');
        res.redirect('/admin/settings');
    }
    catch(e)
    {
        req.flash('error', 'Ошибка. Что-то пошло не так...');
        console.log(e);
    }


    
});

router.get('/tests-category',isAuth, isSuperAdmin, async (req, res) => {



    res.render('admin-tests-category', {
        title: 'Настройки',
        isAdmin: true,

    })
});

router.get('/add-test-category',isAuth, isSuperAdmin, async (req, res) => {

    res.render('admin-add-test-category', {
        title: 'Настройки',
        isAdmin: true,
        error: req.flash('error'),
        success: req.flash('success')
    })
});

router.post('/add-category',isAuth, isAdmin, async (req, res) => {

    try
    {
        await test.addTestCategory(req.body.category, req.body.category_date)
        req.flash('success', `Категория "${req.body.category}" успешно добавлена`)
        res.redirect('/admin/add-test-category')
    }
    catch(e)
    {   
        
        req.flash('error', 'Что то пошло не так...');
        console.log(e)
        res.redirect('/admin/add-test-category')

    }
});

router.get('/add-test',isAuth, isAdmin, async (req, res) => {
   try
   {
        const category = await test.getActualCategory();
        const count_tests = await test.getCountTests(category.id);
        res.render('admin-add-test', {
            title: 'Добавление теста',
            isAdmin: true,
            category,
            count_tests,
            error: req.flash('error'),
            success: req.flash('success')
        });
   } catch(e)
   {
       console.log(e)
       res.redirect('/admin')
   }
});

router.post('/add-test',isAuth, isAdmin, async (req, res) => {
   
    try
    {
        const {answers, question} = req.body;
        const JSON_answers = JSON.parse(answers.trim());
        if(question.trim().length < 6)
        {
            req.flash('error', 'Слишком короткий вопрос');
            res.redirect('/admin/add-test')
        } else 
        {
            await test.addTest(question.trim(), answers.trim());
            req.flash('success', 'Вопрос успешно добавлен');
            res.redirect('/admin/add-test')
        }
       

    }
    catch(e)
    {
        console.log(e);
        req.flash('error', 'Ошибка введенных данных');
        res.redirect('/admin/add-test')
    }


    
});

router.get('/results',isAuth, isAdmin, async (req, res) => {
    try{
        const categories = await admin.getCategories();
        res.render('admin-results', {
            title: 'Панель адмнистратора',
            categories,
            isAdmin: true
          
        });

    } catch(e)
    {
        req.flash('error', 'Ошибка. Что-то пошло не так...');

        res.render('admin-results', {
            title: 'Панель адмнистратора',
            error: req.flash('error')
        });
        console.log(e)
    }
   

    
});

router.get('/results/:category_id',isAuth, isAdmin, async (req, res) => {

    try{
        
        const category = await admin.getCategoryById(req.params.category_id);
        const results = await admin.getResults(category.id);
        
        if(category.length == 0)
        {
            res.redirect('/admin/results');
        }
        else if(results.length > 0)
        {
            res.render('admin-results-id', {
                title: 'Панель адмнистратора',
                results,
                category,
                isAdmin: true
                
              
            });
        } else 
        {
            res.redirect('/admin/results')
        }
        

    } catch(e)
    {
        req.flash('error', 'Ошибка. Что-то пошло не так...');

        res.render('admin-results', {
            title: 'Панель адмнистратора',
            error: req.flash('error')
        });
        console.log(e)
    }
   

    
});

router.get('/results/:category_id/sortBySurname',isAuth, isAdmin, async (req, res) => {

    try{
        
        const category = await admin.getCategoryById(req.params.category_id);
        const results = await admin.getResultsSortBySurname(category.id);
        
        if(category.length == 0)
        {
            res.redirect('/admin/results');
        }
        else if(results.length > 0)
        {
            res.render('admin-results-id', {
                title: 'Панель адмнистратора',
                results,
                category,
                isAdmin: true
                
              
            });
        } else 
        {
            res.redirect('/admin/results')
        }
        

    } catch(e)
    {
        req.flash('error', 'Ошибка. Что-то пошло не так...');

        res.render('admin-results', {
            title: 'Панель адмнистратора',
            error: req.flash('error')
        });
        console.log(e)
    }
   

    
});


router.get('/users',isAuth, isAdmin, async (req, res) => {
    try
    {
        const users = await user.getUsers();
        res.render('admin-users', {
            title: 'Пользователи',
            users,
            isAdmin: true
        })
    }
    catch(e)
    {
        console.log(e)
        res.redirect('/admin')
    }
});

router.get('/users/:user_id',isAuth, isAdmin, async (req, res) => {
   try
   {
        const u = await user.geetUserById(req.params.user_id);
        const results = await admin.getTestResultsByUserId(req.params.user_id);
        
        if(u)
        {
            res.render('admin-user', {
                title: 'Пользователь ',
                u,
                results,
                isAdmin: true
            })
        }
        else 
        {
            res.redirect('/admin/users')
        }
   }
   catch(e)
   {
        res.redirect('/admin/users')
       console.log(e)
   }
   
});

router.get('/users/:user_id/:test_id',isAuth, isAdmin, async (req, res) => {
    try
    {
        const u = await user.geetUserById(req.params.user_id);
        const result = await admin.getTestResultByUserIdResultId(req.params.user_id, req.params.test_id);
    
    
        if(u && result)
        {
            res.render('admin-user-result', {
                title: 'Пользователь',
                u,
                result,
                isAdmin: true
            })
        }
        else 
        {
            res.redirect('/admin/users')
        }
    } catch(e)
    {
        console.log(e)
        res.redirect('/admin/users')
    }
   
});

router.get('/retake-test/:category_id',isAuth, isAdmin, async (req, res) => {
    
   try
   {
        const settings = await test.getSettings();
        const category = await admin.getCategoryById(req.params.category_id);
        const users = await admin.getUsersForRetakeTest(category.id);
        

        if(category.length < 0)
        {
            res.redirect(`/admin/results/${category.id}`);
        }
        else if(settings.blocked == 1)
        {
            res.render('admin-retake-test', {
                title: 'Разрешение на пересдачу',
                users: 0,
                error: req.flash('error'),
                success: req.flash('success'),
                category_id: category.id,
                category,
                isAdmin: true
            });
        }
        else if(settings.id_test_category != category.id)
        {
            res.render('admin-retake-test', {
                title: 'Разрешения на пересдачу',
                users: 0,
                error: req.flash('error'),
                success: req.flash('success'),
                category_id: category.id,
                category,
                isAdmin: true
            });
        }
        else 
        {
            res.render('admin-retake-test', {
                title: 'Разрешения на пересдачу',
                users,
                error: req.flash('error'),
                success: req.flash('success'),
                category_id: category.id,
                category,
                isAdmin: true
            })
        }
   }
   catch(e)
   {
       console.log(e)
       res.redirect('/admin')
   }
    
    
});

router.post('/retake-test',isAuth, isAdmin, async (req, res) => {
 
    try
    {
        const check_current_test = await admin.checkActualCurrentTest(req.body.user_id);
        const current_user = await user.geetUserById(req.body.user_id);
        const category = await admin.getCategoryById(req.body.category_id);
        const settings = await test.getSettings();
       
        if(category.length < 0)
        {
            res.redirect(`/admin/results`);
        }
        else if(settings.blocked == 1)
        {
            res.redirect(`/admin/results/${category.id}`);
        }
        else if(settings.id_test_category != category.id)
        {
            res.redirect(`/admin/results/${category.id}`);
        }
        
        else if(check_current_test.length == 0){
            try
            {
                await user.addTest(current_user.iin, current_user.id, 1, category.id)
                req.flash('success', `Доступ успешно выдан пользователю <b>${current_user.name} ${current_user.surname}</b>`);
                res.redirect(`/admin/retake-test/${category.id}`);
               ;
            }
            catch(e)
            {
                req.flash('error', 'Произошла ошибка, обратитесь к администратору');
                res.redirect(`/admin/retake-test/${category.id}`);
                console.log(e)
            }
            
            
        } else 
        {
            req.flash('error', 'У пользователя имеетcя активный тест');
            res.redirect(`/admin/retake-test/${category.id}`);
        }
    } catch(e)
    {
        req.flash('error', 'Произошла ошибка, обратитесь к администратору');
        res.redirect(`/admin/retake-test/${category.id}`);
        console.log(e);
    }
    
});


router.get('/results-retake/:category_id',isAuth, isAdmin, async (req, res) => {
    try{
        
        
        const category = await admin.getCategoryById(req.params.category_id);
        const category_id = category.id;
        const results = await admin.getResultsRetake(category_id);
        if(results.length > 0)
        {
            res.render('admin-results-retake', {
                title: 'Панель адмнистратора',
                results,
                category_id,
                category,
                isAdmin: true
              
            });
        } else
        {
            res.redirect(`/admin/results/${category_id}`)
        }
        

    } catch(e)
    {
        req.flash('error', 'Ошибка. Что-то пошло не так...');

        res.render('admin-results-retake', {
            title: 'Панель адмнистратора',
            error: req.flash('error'),
            isAdmin: true
        });
        console.log(e)
    }
});


module.exports = router;