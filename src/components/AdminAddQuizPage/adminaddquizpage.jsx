import React, { Component } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import adminPage from '../AdminPage/adminpage.jsx';
import Input from '../Input/input.jsx';
import Button from '../Button/button.jsx';
import styles from './style.css';

class AdminAddQuizPage extends Component {
  constructor(props) {
    super(props);
    const token = localStorage.getItem('token');

    this.state = {
      name: '',
      size: null,
      categories: [],
      selectedCategory: '',
    };

    this.axiosConfig = {
      baseURL: 'http://localhost:3000/api/v1',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    this.handleName = this.handleName.bind(this);
    this.handleSize = this.handleSize.bind(this);
    this.handleCategory = this.handleCategory.bind(this);
    this.addQuiz = this.addQuiz.bind(this);
  }

  handleName(e) {
    this.setState({ name: e.target.value });
  }

  handleSize(e) {
    this.setState({ size: e.target.value });
  }

  handleCategory(selectedCategory) {
    this.setState({ selectedCategory: selectedCategory.value });
  }

  async addQuiz(e) {
    e.preventDefault();

    if (this.state.name === '' || this.state.size === null || this.state.category === null) {
      toast('Uzupełnij wszystkie pola!', {
        type: 'error',
      });
    } else {
      try {
        const result = await axios.post('/quiz', {
          name: this.state.name,
          size: this.state.size,
          category_id: this.state.selectedCategory,
        }, this.axiosConfig);

        if (result.status === 201) {
          this.props.history.push('/admin/quiz/list');

          toast('Test został dodany!', {
            type: 'success',
          });
        }
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
        toast(`Wystąpił błąd!: ${error}`, {
          type: 'error',
        });
      }
    }
  }

  async callAPIEndpoints() {
    const categories = await axios.get('http://localhost:3000/api/v1/category');
    this.setState({ categories: categories.data });
  }

  componentWillMount() {
    this.callAPIEndpoints();
  }

  render() {
    let categories = null;

    if (this.state.categories.length > 0) {
      categories = this.state.categories.map((q) => { // eslint-disable-line
        return {
          value: q.id,
          label: q.name,
        };
      });
    }

    return (
      <div>
        <h2 className={styles.title}>Dodaj test</h2>
        <form>
          <Input type="text" placeholder="Nazwa" onChange={this.handleName} border="true" />
          <Input type="number" placeholder="Ilość losowanych pytań" onChange={this.handleSize} border="true" min="1" />
          <Select
            className={styles.select}
            name="xd"
            placeholder="Kategoria"
            value={this.state.selectedCategory}
            onChange={this.handleCategory}
            options={categories}
          />
          <Button text="Dodaj" action={this.addQuiz} center="true" />
        </form>
      </div>
    );
  }
}

export default adminPage(AdminAddQuizPage);
