import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import "./auth.html";
//ui
import "./ui/bootstrap.min.js";
import "./ui/perfect-scrollbar.jquery.js";
import "./ui/main.js";
//logic
import "./startup/route.js";
import "./startup/globalHelpers.js";
import "./student/client/main.js";
import "./admin/client/main.js";
