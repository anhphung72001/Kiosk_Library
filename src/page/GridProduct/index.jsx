import { Button, Col, Row, Spin, Image, Space } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import _ from "lodash";
import { database } from "../../firebase";
import {
  ref,
  push,
  update,
  remove,
  onValue,
  get,
  orderByChild,
  equalTo,
  query,
} from "firebase/database";
import "./styles.scss";

const listBTN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const GridBooks = () => {
  const [listBooks, setListBooks] = useState(() => {
    const savedList = localStorage.getItem("list-book");
    return savedList ? JSON.parse(savedList) : [];
  });

  useEffect(() => {
    //Lấy ra danh sách book
    const booksRef = ref(database, "books");
    const unsubscribe = onValue(booksRef, (snapshot) => {
      const booksData = snapshot.val();
      const booksList = booksData
        ? Object.keys(booksData).map((key) => ({ id: key, ...booksData[key] }))
        : [];
      localStorage.setItem("list-book", JSON.stringify(booksList));
      setListBooks(booksList);
    });
    // Hủy theo dõi khi component bị unmount
    return () => unsubscribe(); // Dừng theo dõi khi component unmount
  }, []);
  useEffect(() => {
    //Kiểm tra xem có thông tin người dùng quẹt thẻ hay không
    const borrowersRef = ref(database, "borrowers");
    const unsubscribe = onValue(borrowersRef, (snapshot) => {
      const borrowsData = snapshot.val();
      const borrowsList = borrowsData
        ? Object.keys(borrowsData).map((key) => ({
            id: key,
            ...borrowsData[key],
          }))
        : [];
        console.log("borrowsList", borrowsList)
      if (borrowsList.length > 0) {
        checkUser(borrowsList[0].UID);
      }
    });

    // Hủy theo dõi khi component bị unmount
    return () => unsubscribe(); // Dừng theo dõi khi component unmount
  }, []);
  useEffect(() => {
    //Kiểm tra xem người dùng ấn nút số mấy trên bàn phím
    const selected_bookRef = ref(database, "selected_book");
    const unsubscribe = onValue(selected_bookRef, (snapshot) => {
      const selectedBookData = snapshot.val();
      const selectedBookList = selectedBookData
        ? Object.keys(selectedBookData).map((key) => ({
            id: key,
            ...selectedBookData[key],
          }))
        : [];
      if (selectedBookList.length > 0) {
        const number = selectedBookList[0].index_book;
        if (number === 0) {
          deleteBorrower();
        } else {
          const savedUser = localStorage.getItem("user-info")
            ? JSON.parse(localStorage.getItem("user-info"))
            : null;
          const listBook = localStorage.getItem("list-book")
            ? JSON.parse(localStorage.getItem("list-book"))
            : null;
          if (savedUser && savedUser.id) {
            const bookSelect = listBook[number - 1]; // Lấy thông tin sách đc chọn
            console.log("bookSelect: ", bookSelect);
            if (!bookSelect) {
              logWarning("Sách không tồn tại!");
              deleteSelectBook();
              return;
            }
            if (!bookSelect?.quantity) {
              logWarning("Sách đã hết!");
              deleteSelectBook();
            } else {
              const booksRef = ref(database, `books/${bookSelect.id}`);
              // Cập nhật số lượng mới
              update(booksRef, {
                quantity: bookSelect.quantity - 1,
              });
              addBorrow(bookSelect.id, savedUser.id);
              deleteSelectBook();
            }
          } else {
            deleteSelectBook();
            logError("Quẹt thẻ để mượn sách!");
          }
        }
      }
    });

    // Hủy theo dõi khi component bị unmount
    return () => unsubscribe(); // Dừng theo dõi khi component unmount
  }, []);

  const logError = _.debounce((mess) => {
    toast.error(mess);
  }, 0);
  const logWarning = _.debounce((mess) => {
    toast.warning(mess);
  }, 0);

  const deleteBorrower = () => {
    const booksRef = ref(database, "borrowers");
    remove(booksRef); // Xóa toàn bộ dữ liệu trong bảng books
    localStorage.removeItem("user-info");
    deleteSelectBook();
  };
  const deleteSelectBook = () => {
    const tableRef = ref(database, "selected_book");
    remove(tableRef); // Xóa toàn bộ dữ liệu trong bảng selected_book
  };
  const checkUser = async (UID) => {
    try {
      const tableRef = ref(database, "users");
      const snapshot = await get(
        query(tableRef, orderByChild("UID"), equalTo(UID))
      );
      let studentData = null;
      snapshot.forEach((childSnapshot) => {
        studentData = {
          id: childSnapshot.key,
          ...childSnapshot.val(),
        };
      });
      console.log(studentData)
      if (!!studentData && studentData.status === 0) {
        localStorage.setItem("user-info", JSON.stringify(studentData));
      } else {
        logError("Thẻ của bạn không được mượn sách!");
        deleteBorrower();
      }
    } catch (err) {
      console.log(err)
    }
  };

  const addBorrow = (book_id, user_id) => {
    const borrowsRef = ref(database, "borrows");
    const borrow_date = moment().format("YYYY-MM-DD");
    const due_date = moment().add(70, "days").format("YYYY-MM-DD");
    const newBorrows = {
      book_id: book_id,
      borrow_date,
      borrow_status: 0,
      due_date,
      user_id
    };
    push(borrowsRef, newBorrows);
  };

  const addBorrowers = () => {
    const borrowersRef = ref(database, "borrowers");
    const newBorrows = {
      UID: "123",
    };
    push(borrowersRef, newBorrows);
  };
  const onClickNumber = (number) => {
    const tableRef = ref(database, "selected_book");
    const newSelected = {
      index_book: number,
    };
    push(tableRef, newSelected);
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-20">
      <div className="section">
        <div className="grid-book">
          <Space size={8}>
            <Button onClick={addBorrowers}> Add Borrows</Button>
            {listBTN.map((i) => (
              <Button key={i} onClick={() => onClickNumber(i)}>
                {i}
              </Button>
            ))}
          </Space>
          <Row gutter={[16, 16]}>
            {listBooks.map((i, idx) => (
              <Col span={8} key={i.id}>
                <div className="wrap-book">
                  <div className="book-info">
                    <div className="book-title fs-18 fw-600 max-line5">
                      {i.title}
                    </div>
                    <div className="d-flex align-items-center justify-content-space-between w-100">
                      <div className="book-author max-line1 ">{i.author}</div>
                      <div className="book-quantity mr-4 fw-600">
                        {i.quantity}
                      </div>
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
