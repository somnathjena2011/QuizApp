$(document).ready(function(){
    $('form').on('submit',function(){
        console.log(quiz);
        var qArray = [];
        var oaArray = [];
        var obArray = [];
        var ocArray = [];
        var odArray = [];
        var aArray = [];
        $('form .qns').each(function(i,qn){
            qArray.push($(this).val());
        });
        $('form .A').each(function(i,op){
            oaArray.push($(this).val());
        });
        $('form .B').each(function(i,op){
            oaArray.push($(this).val());
        });
        $('form .C').each(function(i,op){
            oaArray.push($(this).val());
        });
        $('form .D').each(function(i,op){
            oaArray.push($(this).val());
        });
        var noOfQuestions = qArray.length;
        var ans = 'ans';
        for(i=1;i<=noOfQuestions;i++)
        {
            aArray.push($("input[name="+ans+i+"]:checked").val());
        }
        //console.log(aArray);
        var answer;
        var questions = [];
        for(i=0;i<noOfQuestions;i++)
        {
            var options = [oaArray[i],obArray[i],ocArray[i],odArray[i]];
            switch(aArray[i])
            {
                case 'A':
                    answer= oaArray[i];
                    break;
                case 'B':
                    answer= obArray[i];
                    break;
                case 'C':
                    answer= ocArray[i];
                    break;
                case 'D':
                    answer= odArray[i];
                    break;
            }
            var question = {
                question: qArray[0],
                answer: answer,
                options: options
            };
            questions.push(question);
        }

        $.ajax({
            type: 'POST',
            url: '/finish',
            data : {
                questions: questions
            },
            success: function(data){

            }
        });

        return false;
    });
});