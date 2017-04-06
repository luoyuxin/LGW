"use strict";

angular.module('app',['ui.router','ngCookies','validation']);
// ,'ngAnimate'
"use strict";
angular.module('app').value('dict',{}).run(['dict','$http',function(dict,$http){

    $http.get('/data/city.json').then(function(resp){
        dict.city = resp.data;
    });

    $http.get('/data/salary.json').then(function(resp){
        dict.salary = resp.data;
    });
    
    $http.get('/data/scale.json').then(function(resp){
        dict.scale = resp.data;
    });
    console.log(dict);
}]);
"use strict";
angular.module('app').config(['$provide',function($provide){//装饰器

    $provide.decorator('$http',['$delegate','$q',function($delegate,$q){//将$http改名为delegate
        $delegate.post = function (url,data,config){
            var def = $q.defer();
            $delegate.get(url).then(function(resp){
                def.resolve(resp);
            }).catch(function(err){
                def.reject(err);
            });
            return {
                then:function(cb){
                    def.promise.then(cb);
                },
                catch:function(cb){
                    def.promise.then(cb);
                }
            }
        }
            return $delegate;
    }]);
}]);
"use strict";

angular.module('app').config(['$stateProvider','$urlRouterProvider',
    function($stateProvider,$urlRouterProvider){
        $stateProvider.state('main',{
            url:"/main",
            templateUrl:"view/main.html",
            controller:"mainCtrl"
        })
        .state('position',{
            url:'/position/:id',
            templateUrl:'view/position.html',
            controller:'positionCtrl'
        })
        .state('company',{
            url:'/company/:id',
            templateUrl:'view/company.html',
            controller:'companyCtrl'
        })
        .state('search',{
            url:'/search',
            templateUrl:'view/search.html',
            controller:'searchCtrl'
        })
        .state('login',{
            url:'/login',
            templateUrl:'view/login.html',
            controller:'loginCtrl'
        }).state('register',{
            url:'/register',
            templateUrl:'view/register.html',
            controller:'registerCtrl'
        }).state('favorite',{
            url:'/favorite',
            templateUrl:'view/favorite.html',
            controller:'favoriteCtrl'
        }).state('me',{
            url:'/me',
            templateUrl:'view/me.html',
            controller:'meCtrl'
        }).state('post',{
            url:'/post',
            templateUrl:'view/post.html',
            controller:'postCtrl'
        });
        $urlRouterProvider.otherwise('main');
}])
"use strict";

angular.module('app').config(['$validationProvider',function($validationProvider){
    var expression = {
        phone : /^1[\d]{10}$/,
        password: function(value){
            var str = value + '';
            return str.length > 5;
        },
        required:function(value){
            return !!value;
        }
    };

    var defaultMsg = {
        phone:{
            success: '',
            error: '必须是11位的手机号'
        },

        password:{
            success:'',
            error:'长度至少六位'
        },
        required:{
            success:'',
            error:'不能为空'
        }
    };

    $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
}]);
"use strict";
angular.module('app').controller('companyCtrl',['$http','$state','$scope',function($http,$state,$scope){
    $http.get('/data/company.json?id='+$state.params.id).then(function(resp){
        $scope.company = resp.data;
        // $scope.$broadcast('abc',{id:1});//事件名称 对应headBar  
    });
        // $scope.$on('cba',function(event,data){
        //     console.log(event,data);
        // }); //如果放在get请求里面,会等不到参数 发出事件之前要考虑接收方是否加载完成或者初始化完成  
}]);
"use strict";
angular.module('app').controller('favoriteCtrl',['$http','$scope',function($http,$scope){
    $http.get('data/myFavorite.json').then(function(resp){
        $scope.list = resp.data;
    })
}]);
"use strict";
angular.module('app').controller('loginCtrl',['cache','$state','$http','$scope',function(cache,$state,$http,$scope){
    $scope.submit = function(){
        $http.post('data/login.json',$scope.user).then(function(resp){
            // resp = resp.data;
            cache.put('id',resp.data.id);
            cache.put('name',resp.data.name);
            cache.put('image',resp.data.image);
            $state.go('main');
        })
    }
}]);
"use strict";

angular.module('app').controller('mainCtrl', ['$http', '$scope',function($http , $scope){

   $http.get('/data/positionList.json').then(function(resp){
        console.log(resp);
        $scope.list = resp.data;
        console.log($scope.list)
   });

    // $scope.list = [{
    //     id:'1',
    //     name:'销售',
    //     imgSrc:'image/company-3.png',
    //     conpanyName:'千度',
    //     city:'上海',
    //     industry:'互联网',
    //     time:'2016-06-01 11:05'
    // },
    // {
    //     id:'2',
    //     name:'WEB前端',
    //     imgSrc:'image/company-1.png',
    //     conpanyName:'慕课网',
    //     city:'北京',
    //     industry:'互联网',
    //     time:'2016-06-01 01:05'
    // }];
}]);
"use strict";
angular.module('app').controller('meCtrl',['cache','$state','$http','$scope',function(cache,$state,$http,$scope){
    if(cache.get('name')){
        $scope.name=cache.get('name');
        $scope.image = cache.get('image');
    }

    $scope.logout = function(){
        cache.remove('id');
        cache.remove('name');
        cache.remove('image');
        $state.go('main');
    }
}]);
"use strict";
angular.module('app').controller('positionCtrl',['$log','$q','$http','$state','$scope','cache',
    function($log,$q,$http,$state,$scope,cache){
        $scope.isLogin = !!cache.get('name');
        $scope.message = $scope.isLogin ? '投个简历': '去登录';
        function getPosition(){
            var def = $q.defer();//$q是用来延迟加载的对象 defer()延迟加载对象
             $http.get('data/position.json?id='+$state.params.id).then(function(resp){
                $scope.position = resp.data;
                if(resp.data.posted){
                    $scope.message = "以投递";
                }

                def.resolve(resp);//传回参数       
            }).catch(function(err){
                def.reject(err);
            });
            return def.promise;//返回promise Promise是一种异步方式处理值（或者非值）的方法，promise是对象，代表了一个函数最终可能的返回值或者抛出的异常。
        }

       function getCompany(id){
            $http.get('/data/company.json?id='+id).then(function(resp){
                $scope.company = resp.data;
                // console.log($scope.company);
            })
       } 
       getPosition().then(function(obj){
             console.log(obj);
             getCompany(obj.data.companyId);
             console.log(obj.data.companyId);
       });
       $scope.go = function(){
           if( $scope.message !== "以投递"){
                if($scope.isLogin){
                  $http.post('data/handle.json',{
                     id:$scope.position.id
                  }).then(function(resp){
                     $log.info(resp);
                     $log.info(resp.data);
                     $scope.message = "以投递";
                   })
                 }else{
                  // $scope.message = "去登录";
                  $state.go('login');
                 }
           }
       }
    
}]);
"use strict";
angular.module('app').controller('postCtrl',['$http','$scope',function($http,$scope){
    $scope.tabList = [{
        id:'all',
        name:'全部'
    },{
        id:'pass',
        name:'面试邀请',
    },{
        id:'fail',
        name:'不合适'
    }];
    $http.get('data/myPost.json').then(function(resp){
        $scope.positionList = resp.data;
    });

    $scope.filterObj = {};

    $scope.tClick = function(id,name){
        switch(id){
            case 'all':
                delete $scope.filterObj.state;    
            break;
            case 'pass':
                $scope.filterObj.state = '1';
            break;
            case 'fail':
                $scope.filterObj.state = '-1';
            break;
            default:
        }
    }
}]);
"use strict";
angular.module('app').controller('registerCtrl',['$interval','$http','$scope','$state',function($interval,$http,$scope,$state){
    $scope.submit = function(){
        $http.post('data/regist.json',$scope.user).then(function(resp){
            $state.go('login');
        });
    };
    var count = 60;
    $scope.send = function(){ 
        $http.get('data/code.json').then(function(resp){
            if(1===resp.data.state){
                count = 60;
                $scope.time = '60s';
                var interval =  $interval(function(){
                    if(count <= 0){
                        $interval.cancel(interval);
                        $scope.time = '';
                        return 
                    }else{
                        count--;
                        $scope.time = count + 's';
                    }
                },1000)
            }
        });
    }
}]);
'use strict';
angular.module('app').controller('searchCtrl',['dict','$http','$scope',function(dict,$http,$scope){
    $scope.name = '';
    $scope.search = function(){
        $http.get('/data/positionList.json?name='+$scope.name).then(function(resp){
            $scope.positionList = resp.data;
        });
    }
    $scope.search();
    $scope.sheet = {};
    $scope.tabList = [{
        id:'city',
        name:'城市'
    },{
        id:'salary',
        name:'薪酬'
    },{
        id:'scale',
        name:'公司规模'
    }];
    $scope.filterObj = {};
    var tabId = '';

    $scope.tClick = function(id,name){
        tabId = id;
        $scope.sheet.list = dict[id];
        $scope.sheet.visible = true;
    };
    $scope.sClick = function(id,name){
        if(id){
            angular.forEach($scope.tabList,function(item){
                if(item.id === tabId){
                    console.log(tabId);
                    item.name = name;
                    console.log(item.name);
                }
            });
            
            $scope.filterObj[tabId + 'Id'] = id;
        } else {

            delete $scope.filterObj[tabId + 'Id'];

            angular.forEach($scope.tabList,function(item){
                if(item.id === tabId){
                    switch(item.id){
                        case 'city':
                        item.name = '城市';
                        break;
                        case 'salary':
                        item.name = '薪酬';
                        break;
                        case 'scale':
                        item.name = '公司规模';
                        break;

                        default:
                    }
                }
            })
        }
    }

}])
"use strict";
angular.module('app').directive('appCompany',[function(){
    return {
        restrict:'A',
        replate:true,
        templateUrl:'view/template/company.html',
        scope:{
            com:'='
        }
    }
    
}])
"use strict";

angular.module('app').directive('appFoot',[function(){
    return {
        restrict:"A",
        replace:true,
        templateUrl:"view/template/foot.html"
    };
}]);
"use strict";

angular.module('app').directive('appHead',['cache',function(cache){
    return{
        restrict:'A',
        replace:true,
        templateUrl:'view/template/head.html',
        link:function($scope){
            $scope.name = cache.get('name') || '';
        }

    };

}]);


"use strict";
angular.module('app').directive('appHeadBar',[function(){
    return {
        restrict:'A',
        replace:true,
        templateUrl:'view/template/headBar.html',
        scope: {
            text: "@"
        },
        link:function($scope){
            $scope.back = function(){
                window.history.back();
            };
            // $scope.$digest();//当双向数据绑定失效的话调用这个函数同步一下 
            // $scope.$on('abc',function(event,data){
            //     console.log(event,data);
            // });
            // $scope.$emit('cba',{name:2});
        }
    };
}]);
"use strict";
angular.module('app').directive('appPositionClass',[function(){
    return {
        restrict:'A',
        replace:true,
        templateUrl:'view/template/positionClass.html',
        scope:{
            com:'='
        },
        link:function($scope){
            $scope.showPositionList = function(idx){
                // console.log($scope.com);
                $scope.positionList = $scope.com.positionClass[idx].positionList;
                // console.log($scope.positionList);
                $scope.isActive = idx;
            }
            $scope.$watch('com',function(newVal){
                if(newVal)$scope.showPositionList(0);
            })
        }
    }
}]);
"use strict";
angular.module('app').directive('appPositionInfo',['$http',function($http){
    return {
        restrict:'A',
        replate:true,
        templateUrl:'view/template/positionInfo.html',
        scope:{
            isActive:'=',
            isLogin:'=',
            pos:'='
        },
        link:function($scope){
            $scope.$watch('pos',function(newVal){
                if(newVal){
                    $scope.pos.select = $scope.pos.select ||false;
                    $scope.imagePath = $scope.pos.select ? 'image/star-active.png' : 'image/star.png';
                }
            })
            $scope.favorite = function(){
                $http.post('data/favorite.json',{
                    id:$scope.pos.id,
                    select:$scope.pos.select
                }).then(function(resp){
                    $scope.pos.select = !$scope.pos.select;
                    $scope.imagePath = $scope.pos.select ? 'image/star-active.png' : 'image/star.png';
                })
            }
            
        }
    }
    
}])
"use strict";
angular.module('app').directive('appPositionList',['$http',function($http){
    return {
        restaice:"A",
        replace:true,
        templateUrl:"view/template/positionList.html",
        scope:{
            data:'=',
            filterObj:'=',
            isFavorite:'='
        },
        link:function($scope){
            $scope.select = function(item){
                $http.post('data/favorite.json',{
                    id:item.id,
                    select:!item.select
                }).then(function(resp){
                    item.select = !item.select;

                })
            }
        }
    };

}]);
"use strict";
angular.module('app').directive('appSheet',[function(){
    return {
        restrict:'A',
        replacr:true,
        scope:{
            list : '=',
            visible:'=',
            select: '&'
        },
        templateUrl:'view/template/sheet.html'
    };
}]);
"use strict";
angular.module('app').directive('appTab',[function(){
    return {
        restrict:'A',
        replacr:true,
        scope:{
            list: '=',
            tabClick : '&'
        },
        templateUrl:'view/template/tab.html',
        link:function($scope){
            $scope.click = function(tab){
                $scope.selectId = tab.id;
                $scope.tabClick(tab);
            }
        }
    };
}]);
"use strict";
angular.module('app').filter('filterByObj',[function(){//调用过滤器函数去一个名字为filterByObj
    return function(list,obj){  //它返回的是一个函数 接受的一个是数组,第二个是过滤的对象
        var result = [];
        angular.forEach(list,function(item){
            var isEqual = true;  //默认是相等的
            for(var e in obj){
                if(item[e]!==obj[e]){
                    isEqual = false; //如果不相等就等于false
                }
            }
            if(isEqual){
                result.push(item);//如果相等就把itempush进result里面
            }
        })
        return result;
    }
}])
'use strict';
//自定义服务 返回的是直接的函数
angular.module('app').service('cache',['$cookies',function($cookies){
    this.put = function(key ,value){
        $cookies.put(key,value);
    };
    this.get =  function(key){
        return $cookies.get(key);
    };
    this.remove = function(key){
        $cookies.remove(key);
    }
    
}]);
// 工厂模式 返回的是对象
// angular.module('app').factory('cache',['$cookies',function($cookies){
//     return {
//         put : function(key ,value){
//             $cookies.put(key,value);
//         },

//         get : function (key){
//             return $cookies.get(key);
//         },
//         remove:function(key){
//             $cookies.remove(key);
//         }

//     }
    
// }]);