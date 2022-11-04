import "./Columns.scss";
import Card from "../Card/Card";
import { mapOrder } from "../../utilities/sorts";
import { Container, Draggable } from "react-smooth-dnd";
import Dropdown from 'react-bootstrap/Dropdown';
import ConfirmModal from "../Commom/ConfirmModal";
import { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import { MODAL_ACTION_ClOSE, MODAL_ACTION_CONFIRM } from '../../utilities/constant';
import { v4 as uuidv4 } from 'uuid';

const Column = (props) => {

  const {column, onCardDrop, onUpdateColumn} = props;
  const cards = mapOrder(column.cards, column.cardOrder, 'id');

  const [isShowModalDelete, setShowModalDelete] = useState(false);
  const [titlecolumn, setTitleColumn] = useState("");
  const[isFirstClick, setIsFirstClick] = useState("true");

  const inputRef = useRef(null);

  const [isShowAdNewCard, setIsShowAddNewCard] = useState(false);
  const [valueTextArea, setValueTextArea] = useState("");
  const textAreaRef = useRef(null);

  useEffect(()=>{
    if(isShowAdNewCard === true && textAreaRef && textAreaRef.current){
      textAreaRef.current.focus();
    }
  },[isShowAdNewCard])
  useEffect(()=>{
    if(column && column.title){
      setTitleColumn(column.title)
    }
  }, [column,  column.title]);

  const toggleModal = () =>{
    setShowModalDelete(!isShowModalDelete);
  }
  const onModalAction = (type) => {
    if(type === MODAL_ACTION_ClOSE){
        //do nothing
;    }
    if(type === MODAL_ACTION_CONFIRM){
        //remove a column
        const newColumn= {
          ...column,
          _destroy: true
        }
        onUpdateColumn(newColumn)
    }
    toggleModal();
  }
  
  const selectAllText = (event) =>{
    setIsFirstClick(false);
    if(isFirstClick){
      event.target.select();
    }else{
      inputRef.current.setSelectionRange(titlecolumn.length, titlecolumn.length);
    }
    //event.target.focus();

  }

  const handleClickOutside = () =>{
    //do something
    setIsFirstClick(true);
    const newColumn= {
      ...column,
      title: titlecolumn,
      _destroy: false
    }
    onUpdateColumn(newColumn)
  }

  const handleAddNewCard = () => {
    //validate
    if(!valueTextArea){
      textAreaRef.current.focus();
      return;
    }

    const newCard = {
      id:uuidv4(),
      boardId: column.boardId,
      columnId: column.id,
      title: valueTextArea,
      image:null      
    }

    let newColumn = {...column};
    newColumn.cards =[...newColumn.cards, newCard];
    newColumn.cardOrder = newColumn.cards.map(card => card.id);

    //console.log("newColumn: ",newColumn);
    onUpdateColumn(newColumn);
    setValueTextArea("");
    setIsShowAddNewCard(false);
  }
  return (
    <>
      <div className="column">
        <header className="column-drag-handle">
          <div className="column-title">           
            <Form.Control
              size={'sm'}
              type="text"
              value= {titlecolumn}
              className="customize-input-column"
              onClick={selectAllText}
              onChange={(event) => setTitleColumn(event.target.value)}
              spellCheck="false"
              onBlur={handleClickOutside}
              onMouseDown ={(e) => e.preventDefault()}
              ref = {inputRef}
            />
          </div>
          <div className="column-dropdown">
          <Dropdown>
            <Dropdown.Toggle variant="" id="dropdown-basic" size="sm">
            
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#">Add Card...</Dropdown.Item>
              <Dropdown.Item onClick={toggleModal}>Remove this column</Dropdown.Item>
              <Dropdown.Item href="#">Something else</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          </div>
        </header>
        <div className="card-list">
          <Container
            groupName="col"
            onDrop={(dropResult) => onCardDrop(dropResult, column.id)}
            getChildPayload={(index) => cards[index]}
            dragClass="card-ghost"
            dropClass="card-ghost-drop"
            dropPlaceholder={{
              animationDuration: 150,
              showOnTop: true,
              className: "card-drop-preview",
            }}
            dropPlaceholderAnimationDuration={200}
          >
            {cards &&
              cards.length > 0 &&
              cards.map((card, index) => {
                return (
                  <Draggable key={card.id}>
                    <Card card={card} />
                  </Draggable>
                );
              })}
          </Container>

        {isShowAdNewCard === true &&
          <div className='add-new-card'>
            <textarea
            rows="2"
            className='form-control'            
            placeholder="Enter a title for this card..."
            ref={textAreaRef}
            value={valueTextArea}
            onChange={(event) => setValueTextArea(event.target.value)}
            >
            </textarea>
            <div className='group-btn' >
              <button className='btn btn-primary'
              onClick = {()=> handleAddNewCard()}
              >Add Card</button>
              <i className='fa fa-times icon' onClick={()=> setIsShowAddNewCard(false)}></i>
            </div>
          </div>
        }
        </div>
        {isShowAdNewCard === false &&
          <footer>
            <div className="footer-action"
            onClick={()=> setIsShowAddNewCard(true)}>
              <i className="fa fa-plus icon"></i>Add another card
            </div>
          </footer>
        }
      </div>
      <ConfirmModal
        show={isShowModalDelete}
        title={"Remove a column"}
        content={`Are you sure to remove this column: <b>${column.title}</b>`}
        onAction={onModalAction}
      />
    </>
  );
}

export default Column;
