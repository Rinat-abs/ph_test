const mysql = require('mysql2/promise');
const config = require('../config');


class Admin 
{
    //Получение результатов по категориям
    async getResults(category_id)
    {
        const connection = await mysql.createConnection(config);
        let [rows] = await connection.execute
        (`
            SELECT users.iin as iin, users.id as user_id, users.name as name, users.surname as surname, users.num_ap as ap, results.current_ball as current_ball, results.total_ball as total_ball, results.date as date_test, results.id as id
            FROM results
            INNER JOIN users ON users.id = results.user_id
            WHERE retake = 0 
            AND category_id = ${category_id}
            ORDER BY results.date DESC;
        `);
        await connection.end();


        for(let i = 0; i < rows.length; i++)
        {
            rows[i].date_test = `${this.getZero(rows[i].date_test.getDate())}.${this.getZero(rows[i].date_test.getMonth()+1)}.${this.getZero(rows[i].date_test.getFullYear())}, ${this.getZero(rows[i].date_test.getHours())}:${this.getZero(rows[i].date_test.getMinutes())}:${this.getZero(rows[i].date_test.getSeconds())}`
        }



        return rows;
    }


    // Получение всех вопросов из актуальной категории

    async getAllActualTestQuestions(category_id)
    {
        const connection = await mysql.createConnection(config);
        let [rows] = await connection.execute (`SELECT * FROM tests WHERE category_id = ${category_id}`);
        await connection.end();

        return rows
    }

    // Получение теста по ID

    async getTestById(test_id, category_id)
    {
       
        const connection = await mysql.createConnection(config);
        let [rows] = await connection.execute (`SELECT * FROM tests WHERE id = ${test_id} AND category_id = ${category_id} LIMIT 1`);
        await connection.end();
        
        return rows[0];
    }

    async updateTest(test_id, question, answer)
    {
        // console.log(`${test_id} \n ${question} \n ${answer}`)
        for(let i = 0; i < question.length; i++)
        {
            question = question.replace('"', '*');
            question = question.replace("'", '*');
        }
        for(let i = 0; i < answer.length; i++)
        {
            answer = answer.replace('\r\n', '');
            
        }
        const connection = await mysql.createConnection(config);
        await connection.execute(`UPDATE  tests SET question = '${question}', answers = '${answer}' WHERE id=${test_id}`);
        await connection.end();
    }

    //Получение результатов по категориям сортировка по фамилии
    async getResultsSortBySurname(category_id)
    {
        const connection = await mysql.createConnection(config);
        let [rows] = await connection.execute
        (`
            SELECT users.iin as iin, users.name as name, users.surname as surname, users.num_ap as ap, results.current_ball as current_ball, results.total_ball as total_ball, results.date as date_test
            FROM results
            INNER JOIN users ON users.id = results.user_id
            WHERE retake = 0 
            AND category_id = ${category_id}
            ORDER BY surname ASC;
        `);
        await connection.end();


        for(let i = 0; i < rows.length; i++)
        {
            rows[i].date_test = `${this.getZero(rows[i].date_test.getDate())}.${this.getZero(rows[i].date_test.getMonth()+1)}.${this.getZero(rows[i].date_test.getFullYear())}, ${this.getZero(rows[i].date_test.getHours())}:${this.getZero(rows[i].date_test.getMinutes())}:${this.getZero(rows[i].date_test.getSeconds())}`
        }



        return rows;
    }

     //Получение результатов пересдачи
     async getResultsRetake(category_id)
     {
        const connection = await mysql.createConnection(config);
        let [rows] = await connection.execute
        (`
            SELECT users.iin as iin,users.id as user_id, users.name as name, users.surname as surname, users.num_ap as ap, results.current_ball as current_ball, results.total_ball as total_ball, results.date as date_test, results.id as id
            FROM results
            INNER JOIN users ON users.id = results.user_id
            WHERE retake = 1 AND category_id = ${category_id}
            ORDER BY results.date DESC;
        `);

        let retakeResults = rows;

        [rows] = await connection.execute
        (`
            SELECT users.iin as iin,users.id as user_id, users.name as name, users.surname as surname, users.num_ap as ap, results.current_ball as current_ball, results.total_ball as total_ball, results.date as date_test
            FROM results
            INNER JOIN users ON users.id = results.user_id
            WHERE retake = 0 AND category_id = ${category_id}
            ORDER BY results.date DESC;
        `);

        let results = rows;

        for(let i = 0; i < retakeResults.length; i++)
        {
            for(let j = 0; j < results.length; j++)
            {
                if(retakeResults[i].user_id == results[j].user_id)
                {
                    retakeResults[i].average_ball= (retakeResults[i].current_ball + results[j].current_ball)/2;
                    retakeResults[i].f_current_ball =  results[j].current_ball;
                }
            }
        }


        await connection.end();


        for(let i = 0; i < retakeResults.length; i++)
        {
            retakeResults[i].date_test = `${this.getZero(retakeResults[i].date_test.getDate())}.${this.getZero(retakeResults[i].date_test.getMonth()+1)}.${this.getZero(retakeResults[i].date_test.getFullYear())}, ${this.getZero(retakeResults[i].date_test.getHours())}:${this.getZero(retakeResults[i].date_test.getMinutes())}:${this.getZero(retakeResults[i].date_test.getSeconds())}`
        }


 
        return retakeResults;
    }



    //Результаты тесты по id пользователя
    async getTestResultsByUserId(user_id)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM results WHERE user_id=${user_id} ORDER BY date DESC`);
        await connection.end();
        for(let i = 0; i < rows.length; i++)
        {
            rows[i].date = `${this.getZero(rows[i].date.getDate())}.${this.getZero(rows[i].date.getMonth()+1)}.${this.getZero(rows[i].date.getFullYear())}, ${this.getZero(rows[i].date.getHours())}:${this.getZero(rows[i].date.getMinutes())}:${this.getZero(rows[i].date.getSeconds())}`
        }
        return rows;
    }

    async getTestResultByUserIdResultId(user_id, result_id)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT results.id, results.user_id, results.answers, results.current_ball, results.total_ball, results.retake, results.date, results.category_id, test_categories.category
        FROM results
        INNER JOIN test_categories ON test_categories.id = results.category_id
        WHERE results.user_id=${user_id} AND results.id=${result_id} LIMIT 1`);
        await connection.end();
        for(let i = 0; i < rows.length; i++)
        {
            rows[i].date = `${this.getZero(rows[i].date.getDate())}.${this.getZero(rows[i].date.getMonth()+1)}.${this.getZero(rows[i].date.getFullYear())}, ${this.getZero(rows[i].date.getHours())}:${this.getZero(rows[i].date.getMinutes())}:${this.getZero(rows[i].date.getSeconds())}`;
          
            rows[i].answers = JSON.parse(rows[i].answers)
           
        }
      
        return rows[0];
    }

    
    async getUsersForRetakeTest(category_id)
    {
        const connection = await mysql.createConnection(config);
        let [rows] = await connection.execute(`
        SELECT DISTINCT(user_id) as id, users.iin, users.name, users.surname, users.iin FROM results
        INNER JOIN users ON users.id = user_id
        WHERE 60 > (100 * current_ball)/total_ball
        AND
        category_id=${category_id}
        AND user_id NOT IN (SELECT user_id FROM current_test)
        ORDER BY users.surname
        `);
        // let [rows] = await connection.execute(`SELECT DISTINCT(user_id) as id, users.iin, users.name, users.surname, users.iin FROM results INNER JOIN users ON users.id = user_id WHERE current_ball < 21 AND category_id=${category_id}`);

        // let users = rows;
       
        // [rows] = await connection.execute('SELECT user_id FROM current_test');
        // let arr = []
      
        // for(let i = 0; i < users.length; i++)
        // {   
        //     for(let j = 0; j < rows.length; j++)
        //     {
                
        //         if(users[i].id == rows[j].user_id)
        //         {
                   
        //             delete users[i];
        //             break;
                    
                    
        //         }  
                
           
        //     }
        
        //     if(users[i])
        //     {
        //         arr.push(users[i])
        //     }
        // }


        await connection.end();
        return rows;
        
    }

    // Получение категорий
    async getCategories()
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM test_categories ORDER BY id DESC`);
        await connection.end();
        return rows;
    }

    async getCategoryById(id)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM test_categories WHERE id = ${id} LIMIT 1`);
        await connection.end();
        if(rows.length == 0)
        {
            return 0
        } else 
        {
            return rows[0];
        }
        
      
    }

    // получить актуальную категорию
    async getActulTestCategory()
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM test_categories WHERE blocked=0 ORDER BY id DESC LIMIT 1`);
        await connection.end();
        return rows[0];
    }

    


    async checkActualCurrentTest(user_id)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT id FROM current_test  WHERE finish = 0 AND user_id=${user_id}`);
        await connection.end();
        return rows;
    }



     getZero(num)
    {
        if(num < 10)
        {
            return '0'+num;
        } else 
        {
            return num;
        }
    }

}

module.exports = Admin