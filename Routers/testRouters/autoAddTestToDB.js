const  {Router} = require('express');
const router = Router();
const isAuth = require('../../middleware/auth');
const isSuperAdmin = require('../../middleware/superAdmin');
const path = require('path')
const fs = require('fs');
const Test = require('../../Models/test');

const test = new Test();
function getFile(fileName)
{   
    const file = fs.readFileSync(path.join(__dirname) +'\\'+ fileName, 'utf8').trim();
    return file;
}

function checkJSON(text)
{
    try
    {
        JSON.parse(text)
        console.log(text)
        return true
    }
    catch(e)
    {
        console.log(e)
        return false
    }
}

function splitFile(text)
{
    let textArr = text.split('\r\n'),
    arrObj = [],
    newtextArr = [],
    regNumDots = /^\d{1,5}\./,
    regNumDotsSpace = /^\d{1,5}\s\./,
    regNumBrackets = /^\d{1,5}\)/,
    regNumBracketsSpace = /^\d{1,5}\s\)/,
    regWordDotsRus = /^[А-Яа-я]{1}\./,
    regWordDotsRusSpace = /^[А-Яа-я]{1}\s\./,
    regWordBracketsRus = /^[А-Яа-я]{1}\)/,
    regWordBracketsRusSpace = /^[А-Яа-я]{1}\s\./,
    regWordDotsEng = /^\w{1}\./,
    regWordDotsEngSpace = /^\w{1}\s\./,
    regWordBracketsEng = /^\w{1}\)/,
    regWordBracketsEngSpace = /^\w{1}\s\)/;
    
    for(let i = 0; i < textArr.length; i++)
    {   

        if(textArr[i].trim().length == 0 ||  textArr[i] == ' ')
        {
            textArr.splice(i, 1)
        }

    }

    
    

    for(let i = 0; i < textArr.length; i++)
    {   
        textArr[i] = textArr[i].replace(regNumDots, '');
        textArr[i] = textArr[i].replace(regNumDotsSpace, '');
        textArr[i] = textArr[i].replace(regNumBrackets, '');
        textArr[i] = textArr[i].replace(regNumBracketsSpace, '');
        textArr[i] = textArr[i].replace(regWordDotsRus, '');
        textArr[i] = textArr[i].replace(regWordDotsRusSpace, '');
        textArr[i] = textArr[i].replace(regWordBracketsRus, '');
        textArr[i] = textArr[i].replace(regWordBracketsRusSpace, '');
        textArr[i] = textArr[i].replace(regWordDotsEng, '');
        textArr[i] = textArr[i].replace(regWordDotsEngSpace, '');
        textArr[i] = textArr[i].replace(regWordBracketsEng, '');
        textArr[i] = textArr[i].replace(regWordBracketsEngSpace, '');
        textArr[i] = textArr[i].replace(/\s{1,50}/, '');
        
        if(textArr[i] != '')
        {
            newtextArr.push(textArr[i]);
        }
    }

    textArr = newtextArr
    
    
    console.log('########################################################################')
    for(let i = 0; i < textArr.length; i++)
    {
        console.log(`${i+1}) ${textArr[i]}`)
    }

    console.log('########################################################################')
    console.log(arrObj)
    for(let i = 0; i < textArr.length;)
    {
        if(checkJSON(textArr[i+1]))
        {
            arrObj.push({q: textArr[i], a: textArr[i+1]})
        } else 
        {
            console.log('########################################################################')
            // console.log(textArr[i])
            console.log(`Что-то пошло не так, обратите вниманеие на строку ${[i+1]}`)
            console.log('########################################################################')
            return false
        }
        
        i+=2

    }

    console.log('########################################################################')
    console.log('КОНЕЦ')
    console.log('########################################################################')

    return arrObj;  

    
}





router.get('/',isAuth, isSuperAdmin,async (req, res) => {
    

    const category = await test.getActualCategory() 
    const results = splitFile(getFile('test.txt'))
    console.log(results)
    const countQuestion = await test.getCountTests(category.id)

    // res.send(results)
    res.render('autoAddTest', {
        title: '.',
        results,
        category,
        countQuestion,
        success: req.flash('success'),
        
    })
});

router.get('/done',isAuth, isSuperAdmin, async (req, res) => {
    const results = splitFile(getFile('test.txt'))
        
    for(let i = 0; i < results.length; i++)
    {
        await test.addTest(results[i].q, results[i].a)
    }
    req.flash('success', 'Вопросы успешно добавлены');
    res.redirect('/auto-add-test-to-db')
});

module.exports = router;