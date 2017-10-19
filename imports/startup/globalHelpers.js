//global template helpers
Template.registerHelper("g.Schemas", g.Schemas);
registerGlobalHelpers({
    currentStaff:function(){//currentUser is already in use so currentStaff;
            let sub = Meteor.subscribe('staff.info');
            if(sub.ready()){
                let staff = g.Staffs.findOne();
                return staff;  
            }  
    },
     currentStudent:function(){
            let sub = Meteor.subscribe('student.info');
            if(sub.ready()){
                let student = g.Students.findOne();
                return student;  
            }  
    },
    termSuffix:function(term){
        return g.termSuffix(term);
    },
    termArray:function(){
        return g.termArray;
    },
    sessionArray:function(){
        let session = g.sessionArray(2017);
        return session;
    },
    yearArray:function(){
        let year = g.yearsArray(2017);
        return year;
    },
    classes:function(){
        return g.classArray;
    },
    subjects:function(){
        return g.subjectArray;
    },
    setting:function(){
    let sub = Meteor.subscribe('setting');
        if(sub.ready()){
            let set = g.Settings.findOne({"_id":"default"});
            if(set){
                return set;
            }else{
                return {session:"Session not set",term:"Term not set",notification:"No any notification"};
            }
        }
    },
    isObject:function(arg){
        if(typeof arg == "object"){
            return true;
        }
    },
    dateFormat:function(date){
        return date.toString().substr(0,21);
    },
    dayMonthYear:function(date){
         return date.toString().substr(0,16);
    },
    getObjectKey:function(object){
        return g.getObjectKey(object);
    },
    arrayLength:function(array){
        return array.length;
    },
    getSession:function(sessionName){
        let get = Session.get(sessionName);
        if(get)return get;return;
    },
    resultObjectToArray:function(object){
       return g.objectToArray(object);
    }
});
//end global template helpers
// function registerGlobalHelpers(helpers){
//   _.chain(helpers)
//    .keys()
//    .each((i)=>{Template.registerHelper(i, helpers[i])})
//    .value()
// }
function registerGlobalHelpers(helpers){
  _.each(helpers,(fn,name)=>{Template.registerHelper(name,fn);});
 }
