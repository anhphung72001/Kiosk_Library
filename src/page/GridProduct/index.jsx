import { Button, Col, Row, Space } from "antd";
import {
  equalTo,
  get,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  update,
} from "firebase/database";
import _ from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { database } from "../../firebase";
import { changeUserInfo } from "../../store/userStore";
import "./styles.scss";

const listBTN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const GridBooks = () => {
  const dispatch = useDispatch();
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
    return () => unsubscribe(); // Dừng theo dõi khi màn hình được tải lên thành công
  }, []);
  useEffect(() => {
    //Kiểm tra xem có thông tin người dùng quẹt thẻ hay không
    const borrowersRef = ref(database, "borrowers");
    const unsubscribe = onValue(borrowersRef, (snapshot) => {
      const borrowsData = snapshot.val();
      if (!!borrowsData?.UID) {
        checkUser(borrowsData.UID);
      }
    });
    return () => unsubscribe(); // Dừng theo dõi khi màn hình được tải lên thành công
  }, []);

  useEffect(() => {
    //Kiểm tra xem người dùng ấn nút số mấy trên bàn phím
    const tableRef = ref(database, "keyboard");
    const unsubscribe = onValue(tableRef, (snapshot) => {
      const respData = snapshot.val();
      const numberSelect = respData.key;
      if (numberSelect === 0) {
        resetBorrower();
        toast.success("Đăng xuất thành công.");
      } else if (numberSelect > 0) {
        const savedUser = localStorage.getItem("user-info")
          ? JSON.parse(localStorage.getItem("user-info"))
          : null;
        const listBook = localStorage.getItem("list-book")
          ? JSON.parse(localStorage.getItem("list-book"))
          : null;
        if (savedUser && savedUser.id) {
          const bookSelect = listBook[numberSelect - 1]; // Lấy thông tin sách đc chọn
          if (!bookSelect) {
            toast.warning("Sách không tồn tại!");
            resetKeyBoard();
            return;
          }
          if (!bookSelect?.quantity) {
            toast.warning("Sách đã hết!");
            resetKeyBoard();
          } else {
            //Cập nhật bảng selected_book
            const tableRef = ref(database, `selected_book`);
            update(tableRef, {
              book_index: numberSelect,
            });
            // Cập nhật số lượng mới
            const booksRef = ref(database, `books/${bookSelect.id}`);
            update(booksRef, {
              quantity: bookSelect.quantity - 1,
            });
            addBorrow(bookSelect.id, savedUser.id);
            //reset giá trị sau khi thực hiện xong các tác vụ
            setTimeout(() => {
              resetKeyBoard();
              resetSelectedBook();
            }, 1000);
          }
        } else {
          resetKeyBoard();
          toast.error("Quẹt thẻ để mượn sách!");
        }
      }
    });
    // Hủy theo dõi khi component bị unmount
    return () => unsubscribe(); // Dừng theo dõi khi màn hình được tải lên thành công
  }, []);

  const resetKeyBoard = () => {
    // reset giá trị key
    const tableRef = ref(database, `keyboard`);
    update(tableRef, {
      key: "",
    });
  };
  const resetSelectedBook = () => {
    // reset giá trị book_index
    const tableRef = ref(database, `selected_book`);
    update(tableRef, {
      book_index: "",
    });
  };
  const resetBorrower = () => {
    // reset giá trị UID
    const tableRef = ref(database, `borrowers`);
    update(tableRef, {
      UID: "",
    });
    //Xóa thông tin người dùng lưu trên web
    localStorage.removeItem("user-info");
    dispatch(changeUserInfo({}));
    //Reset bảng key_board
    resetKeyBoard();
    //Reset bảng selected_book
    resetSelectedBook();
  };
  const checkUser = async (UID) => {
    console.log("UID", UID)
    try {
      const tableRef = ref(database, "users");
      const snapshot = await get(
        query(tableRef, orderByChild("UID"), equalTo(UID))
      );
      let studentData = null;
      console.log('snapshot: ', snapshot);
      snapshot.forEach((childSnapshot) => {
        console.log('childSnapshot: ', childSnapshot);
        studentData = {
          id: childSnapshot.key,
          ...childSnapshot.val(),
        };
      });
      if (!!studentData && studentData.status === 0) {
        localStorage.setItem("user-info", JSON.stringify(studentData));
        dispatch(changeUserInfo(studentData));
        toast.success("Quẹt thẻ thành công.");
      } else {
        toast.error("Thẻ của bạn không được mượn sách!");
        resetBorrower();
      }
    } catch { }
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
      user_id,
    };
    push(borrowsRef, newBorrows);
  };

  const addBorrowers = () => {
    const tableRef = ref(database, `borrowers`);
    update(tableRef, {
      UID: "187 364 38 43",
    });
  };
  const onClickNumber = (number) => {
    const tableRef = ref(database, "keyboard");
    update(tableRef, {
      key: number,
    });
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
                  {i.quantity > 0 ? (
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
                  ) : (
                    <div
                      className="d-flex align-item-center justify-content-center"
                      style={{ height: "calc(100% - 45px)" }}
                    >
                      <img
                        src="https://t3.ftcdn.net/jpg/04/30/38/40/240_F_430384041_1G6UymaKYOJBE7wx5QmSHBeTJInkcQJT.jpg"
                        alt="Out of stock"
                      />
                    </div>
                  )}
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