import { useContext, useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import { UserContext } from './App';
import { Link } from 'react-router-dom';

const url = "https://localhost:7022";
const apiPath = url + "/api/location/";
const photoPath = url + "/img/content/";

function Category() {
    const { slug } = useParams();
    const [locations, setLocations] = useState([]);
    const { user } = useContext(UserContext);

    useEffect(() => {
        fetch(apiPath + slug)
            .then(response => response.json())
            .then(data => {
                setLocations(data);
            });
    }, [slug]);

    const loadLocations = useCallback(() => {
        fetch(apiPath + slug)
            .then(response => response.json())
            .then(data => setLocations(data));
    }, [slug]);

    return (
        <div className="Category">
            <h1>Category {slug}</h1>
            <div className="row row-cols-1 row-cols-md-2 g-4">
                {locations.map(loc => <LocationCard location={loc} key={loc.id} />)}
            </div>
            {user && user.role === "Admin" && <AdminLocationForm slug={slug} reload={loadLocations} />}
        </div>
    );
}
function LocationCard(props){
  return <div className="col">
    <div className="card h-100">
      <Link to={"/location/" +  props.location.slug}>
        <img src={photoPath + (props.location.photoUrl ?? "noimage.png")}
         className="card-img-top" alt="image"/>
        <div className="card-body">
          <h5 className="card-title">{props.location.name}</h5>
          <p className="card-text">{props.location.description}</p>
        </div>
      </Link>
    </div>
  </div>;
}

function AdminLocationForm({ slug, reload }) {
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        formData.append('category', slug);

        fetch(apiPath, {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (response.status === 201) {
                    reload();
                } else {
                    response.text().then(alert);
                }
            });
    }, [slug, reload]);

    return (
        <form id="location-form" method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
            <div className="row">
                <div className="col">
                    <div className="input-group mb-3">
                        <span className="input-group-text"><i className="bi bi-person-vcard"></i></span>
                        <input type="text" className="form-control" placeholder="Назва" name="name" required />
                    </div>
                </div>
                <div className="col">
                    <div className="input-group mb-3">
                        <span className="input-group-text"><i className="bi bi-file-text"></i></span>
                        <input type="text" className="form-control" placeholder="Опис" name="description" required />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <div className="input-group mb-3">
                        <label className="input-group-text" htmlFor="photo"><i className="bi bi-image"></i></label>
                        <input type="file" className="form-control" name="photo" id="photo" />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <button type="submit" className="btn btn-primary">Добавить локацию</button>
                </div>
            </div>
        </form>
    );
}

export default Category;





















