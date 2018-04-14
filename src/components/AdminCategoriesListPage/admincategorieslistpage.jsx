import React, { Component } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import adminPage from '../AdminPage/adminpage.jsx';
import List from '../List/list.jsx';
import ListItem from '../ListItem/listitem.jsx';
import Button from '../Button/button.jsx';
import Icon from '../Icon/icon.jsx';
import styles from './style.css';

class AdminCategoriesListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: [],
    };

    this.axiosConfig = {
      baseURL: 'http://localhost:3000/api/v1',
      headers: {
        Authorization: `Bearer ${this.props.token}`,
      },
    };

    this.openSingleCategoryPage = this.openSingleCategoryPage.bind(this);
  }

  async callAPIEndpoints() {
    const categories = await axios.get('/category', this.axiosConfig);
    this.setState({
      categories: categories.data,
    });
  }

  componentWillMount() {
    this.callAPIEndpoints();
  }

  openSingleCategoryPage(id) {
    this.props.history.push(`/admin/category/single/${id}`);
  }

  render() {
    let listItems = null;

    if (this.state.categories.length > 0) {
      listItems = this.state.categories.map((item, key) =>
        <ListItem key={item.id}>
          <Button icon="true" text={<Icon icon="trash" width="19" height="19" />} title="Usuń kategorię" action={async () => {
            const confirm = window.confirm('Czy na pewno chcesz wykonać tą akcje?');
            if (confirm === true) {
              try {
                const config = Object.assign(this.axiosConfig, { data: { id: item.id } });
                const res = await axios.delete('/category', config);

                if (res.status === 200) {
                  toast('Kategoria została usunięta!', {
                    type: 'success',
                  });
                  const { categories } = this.state;
                  categories.splice(key, 1);
                  this.setState({ categories });
                }
              } catch (error) {
                console.error(error); // eslint-disable-line
                toast('Wystąpił błąd!', {
                  type: 'error',
                });
              }
            }
          }} />
          <h3
            className={styles.categoryName}
            onClick={() => { this.openSingleCategoryPage(item.id); }}
          >
            {item.name}
          </h3>
          <span className={styles.count}>{item.question_count} pytań,</span>
        </ListItem>);
    }

    return (
      <div>
        <List header="Lista kategorii">
          {listItems}
        </List>
      </div>
    );
  }
}

export default adminPage(AdminCategoriesListPage);
