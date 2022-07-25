const mysql = require('mysql2/promise');
const config = require('../config');


class Test {

    // тестовая функция для добавления случайных тестовых вопросов в зависимости от категории
    async testFunc(count,categoryID)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT id FROM tests WHERE category_id=${categoryID}`);
        let arr = [];
        let tests = [];
        await connection.end();
        if(rows.length > count)
        {
            for(let i = 0 ; i < count; )
            {
                const num = this.getRandomNum(rows.length);
                if(arr.indexOf(num) == -1)
                {
                    arr.push(num);
                    tests.push(rows[num].id)
                    i++
                }
                

            }
        } else 
        {
            for(let i = 0 ; i < rows.length; )
            {
                const num = this.getRandomNum(rows.length);
                if(arr.indexOf(num) == -1)
                {
                    arr.push(num);
                    tests.push(rows[num].id)
                    i++
                }
                

            }
        }
    
        return tests
    }
    //Получение вопроса  с ответами по ID
    async  getQuestionByID(id)
    {   

        const connection = await  mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM tests WHERE id =${id}`);
       
        rows[0].answers = await JSON.parse(rows[0].answers);
        await connection.end();
        return(rows[0]);
    }

        //Получение только вопроса по ID
    async  getOnlyQuestionByID(id)
    {   

        const connection = await  mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT question as q FROM tests WHERE id =${id}`);
        await connection.end();
        return(rows[0].q);
    


    }

    //Получение случайного числа 
    getRandomNum(max)
    {
        return Math.floor(Math.random() * Math.floor(max));
    }

    //Получение максимального ID из таблицы с вопросами
    async getMaxIdFromQuestions()
    {
        const connection = await  mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT MAX(id) FROM tests`);
        await connection.end();
        return(rows[0]['MAX(id)']);
       
    }


    //формирование случайных ответов.
    async getRandomAnswers(id)
    {
        let question = await this.getQuestionByID(id);
        let r = [];
        let randomAnswers = [];
        for(let i = 0; i < Object.keys(question.answers).length;)
        {
            let randomNum = this.getRandomNum(Object.keys(question.answers).length);
            if(r.indexOf(randomNum) == -1)
            {
                r.push(randomNum);
                randomAnswers.push(question.answers[`${randomNum + 1}`]);
                i++;
            }

        }
        question.answers = randomAnswers;

       return question;

    }   
    
    // Получение номеров случайных вопрсоов
    async getRandomArrNum(count)
    {
        const maxNum = await this.getMaxIdFromQuestions();
        let randomArrNum = [];

        
        for(let i = 0; i < count;)
        {   
       
            let randomNum = this.getRandomNum(maxNum) + 1;
            if(randomArrNum.indexOf(randomNum) == -1)
            {
                randomArrNum.push(randomNum);
                i++
            }

        }

        return randomArrNum;
    }

    async getRandomArrNum2(count, categoryID)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT id FROM tests WHERE category_id=${categoryID}`);
        let arr = [];
        let tests = [];
        await connection.end();
        if(rows.length > count)
        {
            for(let i = 0 ; i < count; )
            {
                const num = this.getRandomNum(rows.length);
                if(arr.indexOf(num) == -1)
                {
                    arr.push(num);
                    tests.push(rows[num].id)
                    i++
                }
                

            }
        } else 
        {
            for(let i = 0 ; i < rows.length; )
            {
                const num = this.getRandomNum(rows.length);
                if(arr.indexOf(num) == -1)
                {
                    arr.push(num);
                    tests.push(rows[num].id)
                    i++
                }
                

            }
        }
        
        return tests
    }
    //Получение массива со случайными вопросами и ответами
    async getRandomArr(randomArrNum)
    {
       
        let randomArr = [];
        
        for(let i = 0; i < randomArrNum.length; i++)
        {   
            randomArr.push(await this.getRandomAnswers(randomArrNum[i]))
        }


        return randomArr;
    }

    // Предварительная обработка данных теста полученных от пользователя
    async dataProcessing(data)
    {
        
        await this.finishCurrentTest(data.currentTestId);
        const keyArr = [];

        for (let key in data) {
            keyArr.push(key) 
        }
        for(let i = 0; i < keyArr.length;)
        {   

            if(i+1 == keyArr.length)
            {
                data[`answer${keyArr[i].substr(8, keyArr[i].length)}`]= false;
            } else 
            {
                if(keyArr[i].substr(8, keyArr[i].length) == keyArr[i+1].substr(6, keyArr[i].length))
                {
                    i++;
    
                } else 
                {
                    data[`answer${keyArr[i].substr(8, keyArr[i].length)}`]= false;
                }
            }
           

            i++;
        }

        let tempArr = [];

        for (let key in data) {
            if(key.indexOf('question') != -1)
            {   
                let newKey = data[key]
                let newAnswer = `answer${key.substr(8, key.length)}`
                let newAnswerData = data[newAnswer];
                let obj = {id : newKey, answer: newAnswerData}
                tempArr.push(obj)
            }
          
        }

       return(tempArr)
    }

    //проверка одного вопроса
    async checkOneQuestion(id, answer)
    {
       
        const question = await this.getQuestionByID(id);

        if(question.answers[1] == answer)
        {
            return true
        } else {
            return false
        }
        
     
    }

    // Проверка на currentТest на принадлежность к пользователю
    async checkUserOnCurrentTest(userId, currentTestId)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM current_test WHERE user_id = ${userId} AND id = ${currentTestId}`);
        await connection.end();
        if(rows[0] == undefined)
        {
            
            return 0;
        } else 
        {
        
            return 1;
        }
        
    }
    
    // Проверка теста
    async checkTest(data)
    {
        let answers = await this.dataProcessing(data);

        const totalBall = answers.length;
        let currentBall = 0;
        let obj = {};
        obj.arr = []


        for(let i = 0; i < totalBall; i++)
        {
            if(await this.checkOneQuestion(answers[i].id, answers[i].answer))
            {
                currentBall++;
                obj.arr.push({q: await this.getOnlyQuestionByID(+answers[i].id), a: answers[i].answer, r: true})

            } else 
            {
                obj.arr.push({q: await this.getOnlyQuestionByID(+answers[i].id), a: answers[i].answer, r: false})
            }
                        
        }

        obj.currentBall = currentBall;
        obj.totalBall = totalBall;
        


        return obj;

        
    }


    // Получить текущий текст

    async getCurrentTest(iin)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM current_test WHERE user_iin = '${iin}'`);
        await connection.end();
        if(rows[0].finish > 0)
        {
            return false
        }
        
        return rows[0];


    }

    // Получить текущий тест по id пользователя
    async getCurrentTestByUserID(id)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM current_test WHERE user_id = '${id}' LIMIT 1`);
        await connection.end();

        return rows[0];


    }

    // Обновление текущего времени таймера
    async updateCurrentTestTimer(id, timer)
    {
        const connection = await mysql.createConnection(config);
        await connection.execute(`UPDATE current_test SET timer=${timer} WHERE id=${id}`);
        const [rows] = await connection.execute(`SELECT timer FROM current_test WHERE id=${id}`);
        await connection.end();
        return rows[0];
    }
    // Завершние текущего теста
    async finishCurrentTest(id)
    {
        const connection = await mysql.createConnection(config);
        await connection.execute(`UPDATE current_test SET finish='1' WHERE id=${id}`);
        await connection.end();

    }

    // удаление текущего теста
    async deleteCurrentTest(current_test_id, user_id)
    {
        const connection = await mysql.createConnection(config);
        await connection.execute(`DELETE FROM current_test WHERE id = ${current_test_id} AND finish=1 AND user_id = ${user_id}`);
        await connection.end();

    }
    
    async addResult(user_id, answers, current_ball, total_ball, retake, category_id)
    {   
        const settings = await this.getSettings();
        const connection = await mysql.createConnection(config);
        await connection.execute(`
        INSERT INTO results
        (user_id, answers, current_ball, total_ball, retake, category_id)
        VALUES
        ('${user_id}', '${answers}', '${current_ball}', '${total_ball}', '${retake}', '${settings.id_test_category}')
        `);
        await connection.end();
    }

    async checkActiveCurrentTest(user_iin)
    {
        const connection = await mysql.createConnection(config);

        const [rows] = await connection.execute(`SELECT finish FROM current_test WHERE user_iin='${user_iin}' AND finish='0'`);
        await connection.end();
        return rows[0];
    }

    //Получение настроек

    async getSettings()
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM settings`);

        await connection.end();
        return rows[0];
    }

    //обновление настроек

    async updateSettings(test_time,number_test )
    {
        const connection = await mysql.createConnection(config);
        await connection.execute(`UPDATE settings SET test_time = ${test_time}, number_test=${number_test} WHERE id = 1
        `);

        await connection.end();
        
    }

    //Получение актуальной категории
    async getActualCategory()
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute('SELECT * FROM `test_categories` ORDER BY `id` DESC LIMIT 1');
        await connection.end();
        return rows[0]
    }

    // получение количества тестов из актуальной категории
    async getCountTests(category_id)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT COUNT(id) as count FROM tests WHERE category_id = ${category_id}`);
        await connection.end();
        return rows[0].count
    }

    //Добавление тестового вопроса и ответов 
    async addTest(question, answers)
    {
        const settings = await this.getSettings();
        const connection = await mysql.createConnection(config);
        for(let i = 0; i < question.length; i++)
        {
            question = question.replace('"', '*');
            question = question.replace("'", '*');
        }
        for(let i = 0; i < answers.length; i++)
        {
            answers = answers.replace('\r\n', '');
            
        }
        await connection.execute(`INSERT INTO tests ( question, answers, category_id) VALUES ( '${question}', '${answers}', '${settings.id_test_category}')`);
        await connection.end();
    
    }


    // Добавить Категорию
    async addTestCategory(category, categoryDate)
    {
        const connection = await mysql.createConnection(config);
        await connection.execute('DELETE FROM current_test');
        await connection.execute(`UPDATE test_categories SET blocked = 1`)
        await connection.execute(`INSERT INTO test_categories (category, blocked, date) VALUES ( '${category}', '0', '${categoryDate.trim()}')`);
        const actualCategory = await this.getActualCategory();
        await connection.execute(`UPDATE settings SET id_test_category = '${actualCategory.id}' WHERE settings.id = 1`)
        await connection.end();
        

        

    }


    

}

module.exports = Test;