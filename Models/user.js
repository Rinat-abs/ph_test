const mysql = require('mysql2/promise');
const { user } = require('../config');
const config = require('../config');
const Test = require('../Models/test');
const test = new Test();


class User {
    constructor(id, email, password)
    {
        this.id = id;
        this.email = email;
        this.password = password;
    }

    //Добавление пользователя в базу данных
    async addUser(iin, name, surname, num_ap)
    {
        name = await name[0].toUpperCase() + name.slice(1).toLowerCase();
        
        surname = await surname[0].toUpperCase() + surname.slice(1).toLowerCase();
        const connection = await mysql.createConnection(config);
        num_ap = num_ap.toLowerCase();
        num_ap = num_ap.replace('апт', '');
        num_ap = num_ap.replace("№", '');
        num_ap = num_ap.replace('#', '');
        num_ap = num_ap.replace('-', '/');
        num_ap = num_ap.replace('_', '/');
        num_ap = num_ap.replace('.', '/');
        num_ap = num_ap.replace("\\", '/');
        
    
        await connection.execute(`INSERT INTO users SET  iin="${iin}", name="${name}", surname="${surname}", num_ap="${num_ap}", password="${surname}" `);
        await connection.end();
    }

    // добавление списка тестов к пользователю

    async addTest(userIIN, userID, retake, id_test_category)
    {
        const settings = await test.getSettings();
        const connection = await mysql.createConnection(config);
        const tests = await test.getRandomArrNum2(settings.number_test, id_test_category);
        await connection.execute
        (`
            INSERT INTO current_test
            (user_iin, tests, timer, finish, retake, user_id)
            VALUES
            ('${userIIN}', '${tests}', '${settings.test_time}',  '0', '${retake}', '${userID}')
        `);
        await connection.end();
        
    }


    //проверка ИИН
    checkIIN(iin)
    {
        iin = iin.trim();
        
        if(iin.length == 12) return true
        else return false;

    }
    // проверка ИИН в базе данных
    async checkIIN_DB(iin)
    {
        try 
        {
            const connection = await mysql.createConnection(config);
            const [rows] = await connection.execute(`SELECT iin FROM users WHERE iin="${iin}" LIMIT 1`);
            const user = [rows][0][0];
            await connection.end();
           
            if(user)
            {
     
                return true;
            } else 
            {

                return false
            }

           
        } catch(err)
        {
            console.log(err);
        }

    }
    //авторизация 

    async getUser(iin, surname)
    {
        try 
        {
            const connection = await mysql.createConnection(config);
            const [rows] = await connection.execute(`SELECT * FROM users WHERE iin="${iin}" AND password="${surname}" LIMIT 1`);
            const user = [rows][0][0];
            await connection.end();
           
            if(user)
            {
                return(user);
            } else 
            {

                return false
            }

           
        } catch(err)
        {
            console.log(err);
            
        }

    }


    // Получение всех пользователей

    async getUsers()
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM users`);
         rows.forEach(async user =>  {
            await connection.execute(`UPDATE current_test SET user_id = ${user.id} WHERE user_iin = ${user.iin}`);
        });
        
        await connection.end();
        return rows;
    }


    // получение вользователей для сдачи теста
    async getUsertsTestPermit()
    {
      
        const connection = await mysql.createConnection(config);
      
        let [rows] = await connection.execute(`SELECT * FROM users 
        WHERE users.id NOT IN (SELECT user_id FROM results WHERE category_id = (SELECT id_test_category FROM settings))
        AND
        users.id NOT IN (SELECT user_id FROM current_test)
		AND users.admin IS NULL`);
        await connection.end();
        return rows;

    }

    async geetUserById(id)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM users WHERE id=${id} LIMIT 1`);
    
        await connection.end();
        return rows[0];
    }

    async getUserByIIN(iin)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM users WHERE iin=${iin} LIMIT 1`);
    
        await connection.end();
        return rows[0];
    }
    

    async getUserByEmail(email)
    {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(`SELECT * FROM users WHERE email="${email}" LIMIT 1`);
        await connection.end();
        const user = rows[0];
        return user;
    }

    async changePass(email ,newPass)
    {
        const connection = await mysql.createConnection(config);
        await  connection.execute(`
            UPDATE users SET 
            resetKey=NULL,
            resetKeyExp=NULL,
            password="${newPass}"
            WHERE email="${email} " LIMIT 1
        `); 
        await connection.end();
    }


    async checkAuth(email)
    {
        const connection =  await mysql.createConnection(config)
        const [rows] = await connection.execute(`SELECT *, LENGTH(session) as length FROM sessions WHERE LENGTH(session) > 200`);

        

        let authArr = [];
        rows.forEach(e => {
            const res = JSON.parse(e.session);
            if(res.user)
            {
                if(res.user.email == email)
                {

                    authArr.push(e)
                }
            }
            
        });

        for(let i = 0; i < authArr.length; i++)
        {
            await connection.execute(`DELETE FROM sessions WHERE sid="${authArr[i].sid}"`);
        }
        
        await connection.end();

    }

    async checkPass(email, pass)
    {
        const user = await new User().getUserByEmail(email);

        if(user.password == pass)
        {
            return true
        }
        return false
    }



}

module.exports = User;