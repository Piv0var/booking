import {useCallback,useContext, useEffect ,useReducer,useState } from "react";
import { json, useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import {UserContext} from './App'


const url = "https://localhost:7022";
const apiPath = url +"/api/room/all/";
const locIdPath = url + "/api/location";
const photoPath = url + "/img/content/";
const formPath = url + "/api/room";


function reducer(state, action)
{
  switch (action.type){
    case 'setLocId' : return {...state, locId: action.payload.id};
    case 'setRooms' : return {...state, rooms: action.payload};

  }
  throw "reducer: ne work"
}


export default function Location(){
  const {slug} = useParams();
 // let [rooms, setRooms] = useState([]);
 // let [locId, setLocId] = useState("");
  const {user} = useContext(UserContext);

  const [state, dispatcher] = useReducer(reducer, {rooms: [], locId: ""});

  useEffect(()=>{
    loadRooms();
    //console.log(_url);
    fetch(`${locIdPath}?slug=${slug}`,{method: 'PATCH'})
    .then(r=>r.json()).then(j => dispatcher({type:'setLocId', payload: j}));
}, [slug]);
const loadRooms = useCallback(()=>{
  const _url = apiPath + slug;
  fetch(_url).then(r => r.json()).then(j => dispatcher({type:'setRooms', payload: j}));

});
  return <>
  <h1>Location: {slug}</h1>
  <div className="row row-cols-1 row-cols-md-4 g-4">
    {state.rooms.map(r => <RoomCard room={r} key={r.id} />)}
  </div>
  {user != null && user.role == "Admin" && <AdminLocation locationId={state.locId} loadRooms={loadRooms}/>}
  </> ;
}

function RoomCard(props) {
    const [starsArray, setStarsArray] = useState(Array.from({ length: props.room.stars }, (_, index) => index + 1));
  
    return (
      <div className="col">
        <div className="card h-100">
          <Link to={"/room/" + (props.room.slug ?? props.room.id)} className="CardRoom">
            <img src={photoPath + (props.room.photoUrl ?? "noimage.png")} className="card-img-top" alt="room" />
            <div className="card-body">
              <h5 className="card-title">{props.room.name}</h5>
              <p className="card-text">{props.room.description}</p>
              <p className="card-text">Цена: {props.room.dailyPrice}</p>
              <p className="card-text">Звезды:  <t></t>
                {starsArray.map((star, index) => (
                  <i className="bi bi-star-fill" key={index}></i>
                ))}
              </p>
            </div>
          </Link>
        </div>
      </div>
    );
  }


function AdminLocation(props) {
    const [roomAdded, setRoomAdded] = useState(false);
  
    const formSubmit = useCallback((e) => {
      e.preventDefault();
      const form = e.target;
      let formData = new FormData(form);
      fetch(formPath, {
        method: 'POST',
        body: formData
      }).then(r => {
        console.log(r);
        if (r.status === 201) {
          setRoomAdded(true); 
          props.loadRooms();
          form.reset(); 
        } else {
          r.text().then(alert);
        }
      });
    });
  return<>
   <hr />
   {roomAdded && <div className="alert alert-success" role="alert">
      Комната успешно добавлена!
    </div>}
    <form id="room-form" method="post" enctype="multipart/form-data" onSubmit={formSubmit}>
     <div className="row">
         <div className="col">
             <div className="input-group mb-3">
                 <span className="input-group-text" id="room-name"><i className="bi bi-person-vcard"></i></span>
                 <input type="text" className="form-control"
                 placeholder="Назва" name="room-name"
                 aria-label="Room Name" aria-describedby="room-name" />
                 <div className="invalid-feedback">Ім'я не може бути порожнім</div>
             </div>
         </div>
         <div className="col">
             <div className="input-group mb-3">
                 <span className="input-group-text" id="room-description"><i className="bi bi-envelope-at"></i></span>
                 <input type="text" className="form-control"
                 name="room-description" placeholder="Опис"
                 aria-label="Description" aria-describedby="room-description" />
                 <div className="invalid-feedback">Опис не може бути порожнім</div>
             </div>
         </div>
     </div>

     <div className="row">
         <div className="col">
             <div className="input-group mb-3">
                 <span className="input-group-text" id="room-slug"><i className="bi bi-lock"></i></span>
                 <input type="text" className="form-control" placeholder="Slug"
                 name="room-slug"
                 aria-label="Room Slug" aria-describedby="room-slug" />
             </div>
         </div>
         <div className="col">
             <div className="input-group mb-3">
                 <span className="input-group-text" id="room-stars"><i className="bi bi-unlock"></i></span>
                 <input type="number" className="form-control"
                 name="room-stars"
                 aria-label="Room Stars" aria-describedby="room-stars" />
             </div>
         </div>
     </div>

     <div className="row">
         <div className="col">
             <div className="input-group mb-3">
                 <label className="input-group-text" for="room-photo"><i className="bi bi-person-circle"></i></label>
                 <input type="file" className="form-control" name="room-photo" id="room-photo" />
             </div>
         </div>

         <div className="col">
             <div className="input-group mb-3">
                 <span className="input-group-text" id="room-price"><i className="bi bi-coin"></i></span>
                 <input type="number" className="form-control"
                 min="100" step="0.01"
                        name="room-price"
                        aria-label="Room price" aria-describedby="room-price" />
             </div>
         </div>
     </div>
     <div className="row">
         <button type="submit" className="btn btn-secondary"
                 name="room-button" value="true">
             Додати
         </button>
     </div>
     <input type="hidden" name="location-id" value={props.locationId} />
 </form>
  </>
}

