import { Button, Col, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import { database } from '../../firebase';
import { ref, push, update, remove, onValue } from "firebase/database";
import "./styles.scss";


const GridBooks = () => {
  const [listBooks, setListBooks] = useState([]);

  const addBook = () => {
    const booksRef = ref(database, 'books');
    push(booksRef, {
        "author": "Giáo sư B",
        "date_added": "2024-10-01",
        "quantity": 5,
        "title": `Giáo trình Xã hội đại cương ${new Date().toString()}.`
    });
  };

   // Lấy danh sách sách từ Firebase
  useEffect(() => {
    const booksRef = ref(database, 'books');
    onValue(booksRef, (snapshot) => {
      const booksData = snapshot.val();
      const booksList = booksData ? Object.keys(booksData).map(key => ({ id: key, ...booksData[key] })) : [];
      console.log(booksList)
      setListBooks(booksList);
    });
  }, []);


  return (
      <div className="d-flex justify-content-center align-items-center mt-20">
        <div className="section">
          <Button onClick={addBook}>Add book</Button>
          <div className="grid-book">
            <Row gutter={[16, 16]}>
              {listBooks.map((i, idx) => (
                <Col span={8} key={i.id}>
                  <div className="wrap-book">
                    <div className="book-info">
                      <div className="book-title fs-18 fw-600 max-line5">{i.title}</div>
                      <div className="d-flex align-items-center justify-content-space-between w-100">
                        <div className="book-author max-line1 ">{i.author}</div>
                        <div className="book-quantity mr-4 fw-600">{i.quantity}</div>
                      </div>
                    </div>
                    <div className="book-number">{idx + 1}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>
  );
};

export default GridBooks;
