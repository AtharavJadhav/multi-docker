import React, { Component } from 'react';
import axios from 'axios';

// Create the Fib component
class Fib extends Component
{
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

    // Fetch the values from the API
    fetchValues = async () => {
        // Get the values from the API
        const values = await axios.get('/api/values/current');

        // Update the state
        this.setState({ values: values.data });
    }

    // Fetch the indexes from the API
    fetchIndexes = async () => {
        // Get the indexes from the API
        const seenIndexes = await axios.get('/api/values/all');

        // Update the state
        this.setState({ seenIndexes: seenIndexes.data });
    }

    // Fetch the values and indexes from the API
    componentDidMount()
    {
        this.fetchValues();
        this.fetchIndexes();
    }

    // Render the component
    renderSeenIndexes() 
    {
        const { seenIndexes } = this.state;
      
        if (seenIndexes.length === 0) {
          return "Loading seen indexes..."; // Display a loading message if data is not yet available
        }
      
        return seenIndexes.map(({ number }) => number).join(", ");
    }
      
    renderValues() 
    {
        const { values } = this.state;
      
        if (Object.keys(values).length === 0) {
          return "Calculating values..."; // Display a loading message if data is not yet available
        }
      
        const entries = [];
      
        for (let key in values) {
          entries.push(
            <div key={key}>
              For index {key}, I calculated {values[key]}
            </div>
          );
        }
      
        return entries;
    }
      
    // Handle the form submit
    handleSubmit = async (event) => {
        // Prevent the default form submit
        event.preventDefault();

        // Post the index to the API
        await axios.post('/api/values', {
            index: this.state.index
        });

        // Clear the index
        this.setState({ index: '' });
    }

    // Render the component
    render()
    {
        // Render the component
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input
                        value={this.state.index}
                        onChange={event => this.setState({ index: event.target.value })}
                    />
                    <button>Submit</button>
                </form>

                <h3>Indexes I have seen:</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated values:</h3>
                {this.renderValues()}
            </div>
        );
    }
}

// Export the component
export default Fib;

// End of file