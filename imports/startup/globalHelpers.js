//global template helpers
Template.registerHelper("g.Schemas", g.Schemas);
registerGlobalHelpers({
    currentStaff:function(){
        let staff = g.Staffs.findOne({"meteorIdInStaff":Meteor.userId()});
        return staff;  
    },
    currentStudent:function(){
        let student = g.Students.findOne({"meteorIdInStudent":Meteor.userId()}) || g.Graduates.findOne({"meteorIdInStudent":Meteor.userId()});
        return student;  
    },
    inboxMessage:function(){
        let userId = Meteor.userId(),inbox,unread;
        let student = g.Students.findOne({"meteorIdInStudent":userId}) || g.Graduates.findOne({"meteorIdInStudent":userId});
        if(student){
            inbox = g.Messages.find({"toClass":student.currentClass},{limit:5});
            unread = g.Messages.find({"toClass":student.currentClass,"readBy":{$ne:userId}});   
        }else{
            inbox = g.Messages.find({"toStaff":userId},{limit:5});
            unread = g.Messages.find({"toStaff":userId,"readBy":{$ne:userId}});
        }
        return {inbox:inbox.fetch().reverse(), unread:unread.count()};
    },
    isCurrentUser:function(id){
        return id===Meteor.userId()?true:false;
    },
    assignment:function(){
        let unanswered, unmarked,recent, userId = Meteor.userId();
        recent = g.Assignments.find({},{limit:5}).fetch().reverse(); 
        if(g.Staffs.findOne({"meteorIdInStaff":userId})){
                unmarked = g.Assignments.find({"answer.id":{$exists:true},"answer.score":{$exists:false}}).count();
                return {unmarked:unmarked, recent:recent};
        }else{
            unanswered = g.Assignments.find({"answer.id":{$ne:userId}}).count();
            return {unanswered:unanswered,recent:recent};
        }        
    },
    checkRole:function(id){
        return Roles.userIsInRole(id, 'editor')?true:false;
        // let user = Meteor.users.findOne({_id:id});
        // console.log(user);
        // if(user)return user;
        // return null;
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
        let set = g.Settings.findOne({"_id":"default"});
            if(set){
                return set;
            }else{
                return {session:"Session not set",term:"Term not set",notification:"No any notification"};
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
