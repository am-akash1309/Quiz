const quizapp = angular.module("quizapp",['ui.router'])

var user = []
var topic_user_selectec = ""

quizapp.controller("bot1", function($scope, $state, $http){
    var elems = document.querySelectorAll('.dropdown-trigger');
    var instances = M.Dropdown.init(elems);

    $scope.username = ""
    $scope.gotologin = () => {
        $state.go("login")
    }
    $scope.gotoadminlogin = () => {
        $state.go("adminlogin")
    }
})

quizapp.controller("bot2", function($scope, $state, $http){
    $scope.email = ""
    $scope.password = ""

    $scope.verifyuser = () => {
        $http({
            method: "POST",
            url:"http://localhost:8000/verify_user",
            data: {
                "email": $scope.email,
                "password": $scope.password
            }
        }).then (function(result){
            if (result.data.status=="ok"){
                user = []
                var obj = {
                    "name": result.data.name,
                    "DOB": result.data.DOB,
                    "email": result.data.email,
                    "password": result.data.password
                }
                user.push(obj)
            }
            if (result.data.status=="ok") {
                $state.go("home")
            }
            else{
                $scope.message=result.data.message
            }
        })
    }

    $scope.gotosignup = () => {
        $state.go("signup")
    }

    $scope.gotoforgotpassword = () => {
        $state.go("forgotpassword")
    }
})

quizapp.controller("bot3", function($scope, $state, $http){
    if(user.length==0){
        $state.go("login")
    }
    else if (user[0].name==undefined){
        $state.go("login")
    }
    else{
        $scope.username = user[0].name

        $http({
            method:"GET",
            url:"http://localhost:8000/get_topics"
        }).then (function(result){
            console.log(result.length)
            if (result.length==0) {
                $scope.chossetopicifnotopicindatabase = false
            }else{
                $scope.chossetopicifnotopicindatabase = true

                for (let i = 0; i < result.data.length; i++) {
                    var object = result.data[i].name
                    $scope.topics.push(object)
                }
            }
        })
    }

    $scope.topics = []

    $scope.gotochoosetopic = () => {
        $state.go("choose_topic")
    }

    $scope.startquiz = (topic) => {
        topic_user_selectec = topic
        $state.go("quiz")
    }
})

quizapp.controller("bot4", function($scope, $state, $http){
    $scope.name=""
    $scope.email=""
    $scope.dob = ""
    $scope.password=""
    $scope.confirmpassword=""

    $scope.signup_user = () => {
        $http({
            method: "POST",
            url:"http://localhost:8000/register_user",
            data: {
                "name": $scope.name,
                "email": $scope.email,
                "dob": $scope.dob,
                "password": $scope.password,
                "confirmpassword": $scope.confirmpassword
            }
        }).then (function(result){
            if (result.data.status=="ok"){
                user=[]
                var obj = {
                    "name": result.data.name,
                    "DOB": result.data.DOB,
                    "email": result.data.email,
                    "password": result.data.password
                }
                user.push(obj)

                M.toast({
                    "html": result.data.message,
                    "classes": "green rounded"
                })
            }
            if (result.data.status=="ok"){
                $state.go("home")
            }
            else{
                $scope.message = result.data.message
            }
        })
        
    }
})

var totalscore = 0
quizapp.controller("bot5", function($scope, $http, $state){
    if(user.length==0){
        $state.go("login")
    }
    else if (user[0].name==undefined){
        $state.go("login")
    }
    else if (topic_user_selectec==""){
        $state.go("choose_topic")
    }
    else{
        $scope.username = user[0].name

        $http({
            method:"POST",
            url:"http://localhost:8000/getquestions",
            data: {
                "topic":topic_user_selectec
            }
        }).then (function(result){
            for (let i = 0; i < result.data.length; i++) {
                var object = result.data[i]
                $scope.questions.push(object)
            }

            question_no = $scope.slide + 1
            $scope.progress = ((question_no)/$scope.questions.length)*100
        }) 
    }

    $scope.slide=0
    $scope.questions = []
    $scope.answer = {}

    $scope.getanswer = () => {
        $scope.answerlist=[]
        for (let i = 0; i < $scope.questions.length; i++) {
            if ($scope.answer[i]==undefined) {
                $scope.answer[i]=""
            }
            $scope.answerlist.push({"answer":$scope.answer[i]})
        }
    }
    $scope.beforeslide = () => {
        $scope.slide -= 1
        question_no -= 1
        $scope.progress = ((question_no)/$scope.questions.length)*100
    }
    $scope.nextslide = () => {
        $scope.slide += 1
        question_no += 1
        $scope.progress = ((question_no)/$scope.questions.length)*100
    }

    $scope.gotoscore = () => {
        $state.go("score")
    }
    $scope.marks = totalscore
    $scope.validate = () => {
        $scope.getanswer()
        $scope.marks = 0
        for (let i = 0; i < $scope.questions.length; i++) {
            if ($scope.questions[i].answer == $scope.answerlist[i].answer) {
                $scope.marks+=1
            }
        }

        totalscore = $scope.marks
    }
    $scope.complete = () => {
        $state.go("home")
    }
})

quizapp.controller("bot6", function($scope, $http, $state){
    $scope.name=""
    $scope.email=""
    $scope.dob=""
    $scope.password=""
    $scope.confirmpassword=""


    $scope.changepassword_hide = true

    $scope.forgot_password = () => {
        $http({
            method: "POST",
            url:"http://localhost:8000/check_dob_of_email",
            data: {
                "email": $scope.email,
                "dob": $scope.dob
            }
        }).then (function(result){
            if (result.data.status=="ok"){
                $scope.changepassword_hide = false
                $scope.message = ""
                $scope.name = result.data.name
            }
            else{
                $scope.message = result.data.message
            }
        })
    }
    $scope.change_password= () => {
        $http({
            method: "POST",
            url:"http://localhost:8000/change_password",
            data: {
                "name": $scope.name,
                "email": $scope.email,
                "dob": $scope.dob,
                "password": $scope.password,
                "confirmpassword": $scope.confirmpassword
            }
        }).then (function(result){
            if (result.data.status=="ok"){
                M.toast({
                    "html": result.data.message,
                    "classes": "green rounded"
                })
            }
            if (result.data.status=="ok"){
                $state.go("login")
            }
            else{
                $scope.message = result.data.message
            }
        })
    }
})

quizapp.controller("bot7", function($scope, $state, $http){
    $scope.email = ""
    $scope.password = ""
    $scope.dob = ""

    $scope.verifyadmin = () => {
        $http({
            method: "POST",
            url:"http://localhost:8000/verify_admin",
            data: {
                "email": $scope.email,
                "password": $scope.password,
                "dob": $scope.dob
            }
        }).then (function(result){
            if (result.data.status=="ok"){
                user=[]
                var obj = {
                    "admin": result.data.name,
                    "DOB": result.data.DOB,
                    "email": result.data.email,
                    "password": result.data.password
                }
                user.push(obj)
                M.toast({
                    "html": result.data.message,
                    "classes": "green"
                })
            }
            if (result.data.status=="ok") {
                $state.go("adminpage")
            }
            else{
                $scope.message=result.data.message
            }
        })
    }
})

quizapp.controller("bot8", function($scope, $state, $http){
    if (user.length==0){
        $state.go("adminlogin")
    }
    else if (user[0].admin==undefined){
        $state.go("adminlogin")
    }
    else{
        $scope.adminname = user[0].admin
    }

    $scope.addquestions = () => {
        $state.go("addquestions")
    }

    $scope.deletequestions = () => {
        $state.go("deltopic")
    }
})

quizapp.controller("bot9", function($scope, $state, $http){
    if(user.length==0){
        $state.go("adminlogin")
    }
    else if (user[0].admin==undefined){
        $state.go("adminlogin")
    }
    else{
        $scope.adminname = user[0].admin
    }

    $scope.input_question = []
    let dummy = {}

    $scope.topic = ""
    $scope.question = ""
    $scope.option1 = ""
    $scope.option2 = ""
    $scope.option3 = ""
    $scope.option4 = ""
    $scope.answer = ""

    $scope.addbtn = false
    $scope.donebtn = false
    $scope.addquesrow = false

    $scope.topicfilled = () => {
        if($scope.topic!=""){
            $scope.addbtn = true
            $scope.donebtn = true
            $scope.addquesrow = true
        }
        else{
            $scope.addbtn = false
            $scope.donebtn = false
            $scope.addquesrow = false
        }
    }

    $scope.addques = () => {
        if ($scope.question=="" || $scope.option1 == "" || $scope.option2 == "" || $scope.option3 == "" || $scope.option4 == "" || $scope.answer == ""){
            M.toast({
                "html":"Please fill out all the fields.",
                "classes": "red"
            })
        }
        else{
            dummy = {
                "question" : $scope.question,
                "option1": $scope.option1,
                "option2": $scope.option2,
                "option3": $scope.option3,
                "option4": $scope.option4,
                "answer": $scope.answer
            }
            $scope.input_question.push(dummy)
            dummy={}
            $scope.question = ""
            $scope.option1 = ""
            $scope.option2 = ""
            $scope.option3 = ""
            $scope.option4 = ""
            $scope.answer = ""
        }
    }

    $scope.done = () => {
        if ($scope.question=="" || $scope.option1 == "" || $scope.option2 == "" || $scope.option3 == "" || $scope.option4 == "" || $scope.answer == ""){
            M.toast({
                "html":"Please fill out all the fields.",
                "classes": "red"
            })
        }
        else{
            dummy = {
                "question" : $scope.question,
                "option1": $scope.option1,
                "option2": $scope.option2,
                "option3": $scope.option3,
                "option4": $scope.option4,
                "answer": $scope.answer
            }
            $scope.input_question.push(dummy)
            
            $http({
                method: "POST",
                url:"http://localhost:8000/add_question_collection",
                data: {
                    "topic": $scope.topic,
                    "questions": $scope.input_question
                }
            }).then (function(result){
                if(result.data.status=="ok"){
                    M.toast({
                        "html": "Topic added successfully",
                        "classes": "green"
                    })
                }
                $state.go("adminpage")
            })
        }
    }
})

quizapp.controller("bot10", function($scope, $state, $http){
    if(user.length==0){
        $state.go("adminlogin")
    }
    else if (user[0].admin==undefined){
        $state.go("adminlogin")
    }
    else{
        $scope.adminname = user[0].admin

        $http({
            method:"GET",
            url:"http://localhost:8000/get_topics"
        }).then (function(result){
            for (let i = 0; i < result.data.length; i++) {
                var object = result.data[i].name
                $scope.topics.push(object)
            }
        })
    }

    $scope.topics = []

    $scope.delete = (topic) => {

        $http({
            method: "POST",
            url:"http://localhost:8000/delete_collection",
            data: {
                "topic": topic
            }
        }).then (function(result){
            if(result.data.status=="ok"){
                M.toast({
                    "html": "Topic deleted successfully",
                    "classes": "red"
                })
            }
            $state.go("adminpage")
        })
    }
})

quizapp.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
    .state("main",{
        url: "/",
        templateUrl:"./loading_page.html",
        controller: "bot1"
    })
    .state("login",{
        url: "/Login",
        templateUrl:"./login_or_signup_page.html",
        controller: "bot2"
    })
    .state("home",{
        url: "/Home",
        templateUrl:"./home_page.html",
        controller: "bot3"
    })
    .state("choose_topic",{
        url: "/Choose Topic",
        templateUrl:"./choose_topic.html",
        controller: "bot3"
    })
    .state("signup",{
        url: "/SignUp",
        templateUrl:"./signup.html",
        controller: "bot4"
    })
    .state("quiz",{
        url: "/Quiz",
        templateUrl:"./quiz_started.html",
        controller: "bot5"
    })
    .state("score",{
        url: "/Score",
        templateUrl:"./score_page.html",
        controller: "bot5"
    })
    .state("forgotpassword",{
        url: "/Change Password",
        templateUrl:"./forgot_password.html",
        controller: "bot6"
    })
    .state("adminlogin",{
        url: "/Admins",
        templateUrl:"./admin_login.html",
        controller: "bot7"
    })
    .state("adminpage",{
        url: "/Admin Page",
        templateUrl:"./admin_page.html",
        controller: "bot8"
    })
    .state("addquestions", {
        url: "/Add Questions",
        templateUrl:"./add_questions.html",
        controller: "bot9"
    })
    .state("deltopic", {
        url: "/Delete Topic",
        templateUrl:"./del_topic.html",
        controller: "bot10"
    })
    $urlRouterProvider.otherwise("/")
})