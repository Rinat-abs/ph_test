//############### Проверка все ли тесты отмечены ###############\\
 
const questions = document.querySelectorAll('.test__pass__question');
const form = document.querySelector('.test__pass');
if(questions && form)
{

    form.addEventListener('submit', function (evt)  {
        let radio = document.querySelectorAll('input[type="radio"]:checked');
        evt.preventDefault();

        if(questions.length == radio.length)
        {
            
            evt.defaultPrevented;
            this.submit();
        }
        else 
        {
            alert('Ответьте на все вопросы');
        }

    });

}