import React from 'react';

class App extends React.Component {

	sayHey(){
	   alert("hey");
	}

    render(){

    	let string = 'Hello React Skeleton !!';
    	let intager = 0;

        return (
        	<div>
            	<h1>{string}</h1>
            	<h2>{intager}</h2>
            	<button onClick={this.sayHey}>Click Me</button>
            </div>	
        );
    }
}

export default App;