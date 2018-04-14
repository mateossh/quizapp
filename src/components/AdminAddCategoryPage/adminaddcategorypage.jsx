import React, { Component } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Dropzone from 'react-dropzone';
import adminPage from '../AdminPage/adminpage.jsx';
import Input from '../Input/input.jsx';
import Button from '../Button/button.jsx';
import styles from './style.css';

class AdminAddCategoryPage extends Component {
  constructor(props) {
    super(props);
    const token = localStorage.getItem('token');

    this.state = {
      name: '',
      file: new FormData(),
    };

    this.axiosConfig = {
      baseURL: 'http://localhost:3000/api/v1',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    this.handleName = this.handleName.bind(this);
    this.handleQuestionFile = this.handleQuestionFile.bind(this);
    this.addCategory = this.addCategory.bind(this);
  }

  handleName(e) {
    this.setState({ name: e.target.value });
  }

  handleQuestionFile(files) {
    this.state.file.delete('file');
    this.state.file.append('file', files[0]);
  }

  async addCategory(e) {
    e.preventDefault();

    if (this.state.name === '' || !this.state.file.has('file')) {
      toast('Uzupełnij wszystkie pola!', {
        type: 'error',
      });
    } else {
      try {
        const result = await axios.post('/category', {
          name: this.state.name,
        }, this.axiosConfig);

        if (result.status === 201) {
          toast('Test został dodany!', {
            type: 'success',
          });

          this.props.history.push('/admin/category/list');
        }

        this.state.file.append('category_id', result.data.category.id);

        await axios.post('http://localhost:3000/api/v1/question/upload', this.state.file);
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
        toast(`Wystąpił błąd!: ${error}`, {
          type: 'error',
        });
      }
    }
  }

  render() {
    return (
      <div>
        <h2 className={styles.title}>Dodaj test</h2>
        <form>
          <Input type="text" placeholder="Nazwa" onChange={this.handleName} border="true" />
          {/* <Input type="file" id="file" onChange={this.handleQuestionFile} border="true" /> */}
          <Dropzone
            className={styles.dropzone}
            onDrop={this.handleQuestionFile}
          >
            Plik *.csv z pytaniami (kliknij, aby wybrać lub przeciągnij plik)
          </Dropzone>
          <Button text="Dodaj" action={this.addCategory} center="true" />
        </form>
      </div>
    );
  }
}

export default adminPage(AdminAddCategoryPage);
