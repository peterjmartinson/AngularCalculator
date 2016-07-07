/*jslint white:true*/
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
    left  : 'empty',
    operator : 'empty',
    right : 'empty',
    pressed         : 0,
    buff            : '',
    currentNumber   : 0,
    currentBuffer   : '',
    currentOperator : '',
    updateBuffer : function(b) {
      console.log('expresson: ' + this.left + ' ' + this.operator + ' ' + this.right);
      // clear the buffer
      if ( b === 'C' ) {
        this.left = 'empty';
        this.operator = 'empty';
        this.right = 'empty';

        this.buff = '';
        this.pressed = 'C';
        console.log ('Cleared!!');
        return {
          buff : this.buff,
          pressed : this.pressed
        };
      }

      // enter a number
      else if (typeof b === 'number') {
        this.left = this.left;
        this.operator = this.operator;
        if ( this.right === 'empty' ) {
          this.right = b;
        }
        else {
          this.right += b;
        }

        this.buff += b.toString();
        this.pressed = b;
        console.log (this.buff);
        return {
          buff : this.buff,
          pressed : this.pressed
        };
      }

      // enter an operator
      // if there is an active operator, replace it
      // if there is no active operator, add it
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
      // if no active operator, evaluate buffer *-1
      // else, evaluate buffer *-1 and append current operator
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

        this.buff += b.toString();
        this.pressed = b;
        console.log (this.buff);
        return {
          buff : this.buff,
          pressed : this.pressed
        };
      }

      // enter =
      // 1) evaluates buffer
      // 2) replaces buffer and screen with current value
      else if ( b === '=' ) {
        this.left = 'empty';
        this.operator = 'empty';
        this.right = operate(this.left, this.operator, this.right);

        this.buff += b.toString();
        this.pressed = b;
        console.log(this.buff);
        return {
          buff : this.buff,
          pressed : this.pressed
        };
      }







      // enter a %
      // multiplies current buffer times 0.01
      // appends the operator if there is one
      else if ( b === '%' ) {
        this.buff += b.toString();
        this.pressed = b;
        console.log (this.buff);
        return {
          buff : this.buff,
          pressed : this.pressed
        };
      }


      // enter .
      // does nothing if buffer contains a decimal
      // else adds a decimal to the buffer
      else if ( b === '.' ) {
        this.buff += b.toString();
        this.pressed = b;
        console.log(this.buff);
        return {
          buff : this.buff,
          pressed : this.pressed
        };
      }


      //
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
