import React, { Component } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import adminPage from '../AdminPage/adminpage.jsx';
import List from '../List/list.jsx';
import ListItem from '../ListItem/listitem.jsx';
import Button from '../Button/button.jsx';
import Icon from '../Icon/icon.jsx';
import styles from './style.css';

class AdminSingleCategoryPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      questions: [],
    };

    this.axiosConfig = {
      baseURL: 'http://localhost:3000/api/v1',
      headers: {
        Authorization: `Bearer ${this.props.token}`,
      },
    };
  }

  async callAPIEndpoints() {
    const questions = await axios.get(`/question/category/${this.props.match.params.id}`, this.axiosConfig);
    this.setState({
      questions: questions.data,
    });
  }

  componentWillMount() {
    this.callAPIEndpoints();
  }

  render() {
    let listItems = null;

    if (this.state.questions.length > 0) {
      listItems = this.state.questions.map((item, key) => {
        const image = item.has_image === true
          ? <div className={styles.questionImage}><img style={{ maxWidth: '100%', display: 'none' }} src={`http://localhost:3000/images/${item.id}`} alt="img" /></div>
          : null;

        return (
          <ListItem key={item.id}>
          <Button icon="true" text={<Icon icon="trash" width="19" height="19" />} title="Usuń pytanie" action={async () => {
            const confirm = window.confirm('Czy na pewno chcesz wykonać tą akcje?');
            if (confirm === true) {
              try {
                const config = Object.assign(this.axiosConfig, { data: { id: item.id } });
                const res = await axios.delete('/question', config);

                if (res.status === 200) {
                  toast('Pytanie zostało usunięte!', {
                    type: 'success',
                  });
                  const { questions } = this.state;
                  questions.splice(key, 1);
                  this.setState({ questions });
                }
              } catch (error) {
                console.error(error); // eslint-disable-line
                toast('Wystąpił błąd!', {
                  type: 'error',
                });
              }
            }
          }} />
          <h3 className={styles.username}> </h3>
          {item.content}
          {item.answer1}
          {item.answer2}
          {item.answer3}
          {item.answer4}
          {image}
        </ListItem>);
      });
    }

    return (
      <div>
        <List header="Lista pytań">
          {listItems}
        </List>
      </div>
    );
  }
}

export default adminPage(AdminSingleCategoryPage);
