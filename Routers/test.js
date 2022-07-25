const {Router} = require('express');
const auth = require('../middleware/auth');
const Test = require('../Models/test');
const test = new Test();


const router = Router();

router.get('/', auth, async(req, res) => {

    // test.testFunc(10, 2)
    let checkFinished = await test.checkActiveCurrentTest(res.locals.user.iin);

    if(checkFinished == undefined)
    {
        checkFinished = false 
    }
    else 
    {
        checkFinished = true;
   }
    res.render('test', {
        title: 'Тест',
        checkFinished,
        isTest: true
    });
});


router.post('/start', auth, async(req, res) => {

    try 
    {
        let currentTest = await test.getCurrentTest(res.locals.user.iin);
        
        if(currentTest.length == 0)
        {
            res.redirect('/');
        } 
        else if(await test.checkUserOnCurrentTest(res.locals.user.id, currentTest.id) == 0)
        {
            res.redirect('/');
        }
        else 
        {
            currentTest.tests =  currentTest.tests.split(',').map(i => +i);
            // let timeMinut = (await test.updateCurrentTestTimer(currentTest.id, currentTest.timer)).timer;
            
            // let timer = setInterval(async function () {
            //     seconds = timeMinut%60 
            //     if (timeMinut <= 0) {
            //         clearInterval(timer);   
            //         await test.updateCurrentTestTimer(currentTest.id, 0);
            //     } else {
            //         console.log(timeMinut)
            //         timeMinut -= 60
                    

            //         await test.updateCurrentTestTimer(currentTest.id, timeMinut);
            //     }
                
                
            // }, 60000)
        
        
            const tests = await test.getRandomArr(currentTest.tests);
            
            res.render('test_pass', {
                title: 'Тестирование',
                tests,
                timer: currentTest.timer,
                currentTestId: currentTest.id
            });
        }
    } catch(e)
    {
        res.redirect('/test')
        console.log(e)
    }
   
});



router.post('/finish', auth, async(req, res) => {
    try
    {   
        if(await test.checkUserOnCurrentTest(res.locals.user.id, req.body.currentTestId) == 0)
        {
            res.redirect('/test');
        }
        else 
        {
            const result = req.body;
            const userId = res.locals.user.id;
            const CR =  await test.checkTest(result);
            const current_test = await test.getCurrentTestByUserID(userId);
            await test.addResult(userId, JSON.stringify(CR.arr), CR.currentBall, CR.totalBall, current_test.retake )

            
            await test.deleteCurrentTest(current_test.id, userId)


            res.render('test_finish', {
                title: 'Тестирование',
                CR
                
            });
            // CR - checked RESULTS
        }

        
    }
    catch(e)
    {
        res.redirect('/test');
        console.log(e)
    }
});





module.exports = router;

// SELECT DISTINCT(results.user_id) as id, users.iin, users.name, users.surname, users.iin
// FROM results
// INNER JOIN users 
// ON users.id = results.user_id
// INNER JOIN current_test 
// ON current_test.user_id != results.user_id
// WHERE current_ball < 21 AND  current_test.user_id != results.user_id