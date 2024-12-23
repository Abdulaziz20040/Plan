import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input, Button, Modal, message } from "antd";
import { CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import "./App.css";

const { TextArea } = Input;

const App = () => {
  const [todos, setTodos] = useState([]);
  const [doneTodos, setDoneTodos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todoData, setTodoData] = useState({
    answer: "",
    questionNumber: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDoneTerm, setSearchDoneTerm] = useState("");

  useEffect(() => {
    fetchTodos();
    fetchDoneTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(
        "https://c37ebab283094df7.mokky.dev/api"
      );
      setTodos(response.data);
    } catch (error) {
      message.error("Ma'lumotlarni olishda xatolik yuz berdi");
    }
  };

  const fetchDoneTodos = async () => {
    try {
      const response = await axios.get(
        "https://c37ebab283094df7.mokky.dev/done"
      );
      setDoneTodos(response.data);
    } catch (error) {
      message.error("Bajarilganlarni olishda xatolik yuz berdi");
    }
  };

  const handleAddTodo = async () => {
    try {
      if (!todoData.answer || !todoData.questionNumber) {
        message.warning("Iltimos, savol, javob va savol raqamini kiriting");
        return;
      }

      const newTodo = { ...todoData, question: todoData.answer }; // Include `question` field
      const response = await axios.post(
        "https://c37ebab283094df7.mokky.dev/api",
        newTodo
      );

      message.success("Yangi To-do muvaffaqiyatli qo'shildi");
      setTodos((prevTodos) => [...prevTodos, response.data]); // Optimistic UI update
      setIsModalOpen(false);
      setTodoData({ answer: "", questionNumber: "" });
    } catch (error) {
      message.error("Saqlashda xatolik yuz berdi");
    }
  };

  const handleDelete = async (id, isDone) => {
    const confirmDelete = window.confirm("O'chirmoqchimisiz?");
    if (!confirmDelete) return;

    const url = isDone
      ? `https://c37ebab283094df7.mokky.dev/done/${id}`
      : `https://c37ebab283094df7.mokky.dev/api/${id}`;
    try {
      await axios.delete(url);
      message.success("Savollar muvaffaqiyatli o'chirildi");
      fetchTodos();
      fetchDoneTodos();
    } catch (error) {
      message.error("O'chirishda xatolik yuz berdi");
    }
  };

  const handleToggleCompleted = async (todo) => {
    try {
      await axios.post("https://c37ebab283094df7.mokky.dev/done", {
        answer: todo.answer,
        questionNumber: todo.questionNumber, // Include questionNumber in the payload
        archived: true,
      });
      await axios.delete(`https://c37ebab283094df7.mokky.dev/api/${todo.id}`);
      message.success("Savol yodlanganlarga qo'shildi");
      fetchTodos();
      fetchDoneTodos();
    } catch (error) {
      message.error("Savolni qo'shishda xatolik yuz berdi");
    }
  };

  const formatTextWithColor = (text) => {
    const regex = /\*(.*?)\*/g;
    return text.split(regex).map((part, index) =>
      index % 2 === 1 ? (
        <span className="colod" key={index}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const filteredTodos = todos.filter((todo) =>
    (todo.question || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoneTodos = doneTodos.filter((todo) =>
    (todo.question || "").toLowerCase().includes(searchDoneTerm.toLowerCase())
  );

  return (
    <div
      style={{
        maxWidth: "1300px",
      }}
      className="p-6 mx-auto text-white rounded-lg shadow-lg min-h-screen"
    >
      <Button
        type="primary"
        onClick={() => setIsModalOpen(true)}
        className="mb-8 py-6 w-full bg-violet-600 hover:bg-violet-700 border-none rounded-lg text-lg"
      >
        Add a new plan
      </Button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h2 className="font-semibold text-2xl mb-6 text-violet-400">Today</h2>

          <div className="space-y-4 cursor-pointer">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex flex-col justify-between p-5 rounded-lg shadow-md bg-gray-800 hover:bg-gray-700 transition duration-300"
              >
                <div className="flex items-start">
                  <div className="text-lg text-gray-300 flex-1">
                    <h1>
                      <span className=" text-yellow-600 font-bold">:</span>
                      {todo.questionNumber} {todo.question}
                    </h1>
                    <hr
                      style={{
                        marginTop: "4px",
                        marginBottom: "4px",
                        borderColor: "aqua",
                      }}
                    />
                    <p>{formatTextWithColor(todo.answer)}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button
                      aria-label="Mark as completed"
                      onClick={() => handleToggleCompleted(todo)}
                      className="text-violet-500 text-xl"
                    >
                      <CheckCircleOutlined />
                    </button>
                    <button
                      aria-label="Delete question"
                      onClick={() => handleDelete(todo.id, false)}
                      className="text-red-500 text-xl"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-2xl mb-6 text-violet-400">
            Previous
          </h2>

          <div className="space-y-4 cursor-pointer">
            {filteredDoneTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex flex-col justify-between p-5 rounded-lg shadow-md bg-gray-700 hover:bg-gray-600 transition duration-300"
              >
                <div className="flex items-start">
                  <div className="text-lg text-gray-400 flex-1">
                    <h1>
                      #{todo.questionNumber} {todo.question}
                    </h1>
                    <hr
                      style={{
                        marginTop: "4px",
                        marginBottom: "4px",
                        borderColor: "aqua",
                      }}
                    />
                    <p>{formatTextWithColor(todo.answer)}</p>
                  </div>
                  <button
                    aria-label="Delete learned question"
                    onClick={() => handleDelete(todo.id, true)}
                    className="text-red-500 text-xl mt-4"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        title="Add a new plan"
        open={isModalOpen}
        onOk={handleAddTodo}
        onCancel={() => setIsModalOpen(false)}
        okText="Qo'shish"
        cancelText="Bekor qilish"
      >
        <div className="space-y-4">
          <TextArea
            value={todoData.answer}
            onChange={(e) =>
              setTodoData({ ...todoData, answer: e.target.value })
            }
            placeholder=" Add palan name"
            rows={4}
          />
          <Input
            value={todoData.questionNumber}
            onChange={(e) =>
              setTodoData({ ...todoData, questionNumber: e.target.value })
            }
            placeholder="Date"
            type="text"
          />
        </div>
      </Modal>
    </div>
  );
};

export default App;