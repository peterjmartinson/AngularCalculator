/*jslint white:true*/
/*
issues:
order of operations
cap the result of calculations to 10 digits
get . to work
*/
'use strict';

angular.module('myApp.calculator',
  ['ngRoute',
  'ngMaterial',
  'ngMessages'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/calculator', {
    templateUrl: 'calculator/calculator.html',
    controller: 'CalculatorCtrl',
    controllerAs: 'calc'
  });
}])

.controller('CalculatorCtrl', function() {
  var self = this,
      signs = /[+\-\*\/]/;

  var operate = function (l, o, r) {
    // need to deal with order of operations
    // for now, just go with first in, first out
    if ( o === '+' ) {
      return l+r;
    }
    else if ( o === '-' ) {
      return l-r;
    }
    else if ( o === '*' ) {
      return l*r;
    }
    else if ( o === '/' ) {
      return l/r;
    }
  };

  self.inBuffer = {
    left:     'empty',
    operator: 'empty',
    right:    'empty',
    screen:   '0',
    updateBuffer: function(b) {
      console.log('expression: ' + this.left + ' ' + this.operator + ' ' + this.right);
      // clear the buffer
      if ( b === 'C' ) {
        this.left = 'empty';
        this.operator = 'empty';
        this.right = 'empty';

        console.log ('Cleared!!');
      }
// this.right.toString().length
// this.right.toFixed()
      // enter a number
      else if (typeof b === 'number') {
        this.left = this.left;
        this.operator = this.operator;
        if ( this.right === 'empty' ) {
          this.right = b;
        }
        else if ( this.right.toString().length < 10 ) {
          this.right = Number(this.right.toString() + b);
        }
      }

      // enter an operator
      else if ( b.match(signs) ) {
        if ( this.left === 'empty' ) {
          this.left = this.right;
          this.operator = b;
          this.right = 'empty';
        }
        else if ( this.left !== 'empty' && this.right !== 'empty' ) {
          this.left = operate(this.left, this.operator, this.right);
          this.operator = b;
          this.right = 'empty';
        }
        else if ( this.left !== 'empty' && this.right === 'empty' ) {
          this.left = this.left;
          this.operator = b;
          this.right = this.right;
        }
      }

      // enter +/-
      else if ( b === 'pm' ) {
        if ( this.left !== 'empty' && this.operator !== 'empty'&& this.right !== 'empty' ) {
          this.left = this.left;
          this.operator = this.operator;
          this.right = this.right * -1;
        }
        else if ( this.left !== 'empty' && this.operator !== 'empty'&& this.right === 'empty' ) { 
          this.left = this.left;
          this.operator = this.operator;
          this.right = this.left * -1;
        }
        else if ( this.left === 'empty' && this.operator === 'empty'&& this.right !== 'empty' ) {
          this.left = 'empty';
          this.operator = 'empty';
          this.right = this.right * -1;
        }
      }

      // enter .
      // problem here is decimal gets wiped out when converted to Number()
      // need to leave this.right a string until it gets evaluated or moved
      // to this.left
      else if ( b === '.' ) {
        if ( Math.round(this.right) === this.right ) {
          console.log('inside the decimal: ' + b);
          this.left = this.left;
          this.operator = this.operator;
          this.right = Number(this.right.toString() + '\.');
        }
      }

      // enter =
      else if ( b === '=' &&
                this.left     !== 'empty' &&
                this.operator !== 'empty' &&
                this.right    !== 'empty' ) {
        this.right = operate(this.left, this.operator, this.right);
        this.left = 'empty';
        this.operator = 'empty';
      }

      // enter square-root
      else if ( b === 'root' ) {
        if ( this.right > 0 ) {
          this.left = this.left;
          this.operator = this.operator;
          this.right = Math.sqrt(this.right);
        }
      }


      // update the screen
      if ( this.right === 'empty' ) {
        if ( this.operator === 'empty' ) {
          this.screen = '0';
        }
        else {
          this.screen = this.left;
        }
      }
      else {
        this.screen = this.right;
      }

      return {
        left:     this.left,
        operator: this.operator,
        right:    this.right,
        screen:   this.screen
      }

    }
  };
});
// need to design some kind of buffer
// starts clear, but concatenates with button pushes
// pressing = parses the buffer and outputs the result
// pressing C re-initializes the buffer
// each button press appends to current buffer
// first idea - buffer should just be a simple string
//   "7+3/20-13"
// but... if it's a parsed string, I need to design order of operations
// so, better to use JS's math engine, somehow.
