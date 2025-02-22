import { useContext } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"
import { AppContext } from "../context/appContext";

export default function View(){

    const {id} = useParams();

    const navigate = useNavigate();

    const {user, token} = useContext(AppContext);

    const [courses, setCourses] = useState(null);

    async function getCourse() {
        const res = await fetch(`/api/courses/${id}`, {
            method: 'get',
            headers:{
                Authorization: `Bearer ${token}`
            }
        });    
        const data = await res.json();

        
        if(res.ok){
            setCourses(data.courses);
            //console.log(data.courses);            
        }
    }

    async function handleDelete(e) {
        e.preventDefault();        

        if(user && user.id === courses.user_id){
            const res = await fetch(`/api/courses/${id}`,{
                method: "delete",
                headers:{
                    Authorization: `Bearer ${token}`,
                }
            });
    
            const data = await res.json();

            if(res.ok){
                navigate("/");           
                console.log(data);    
            }
        }
       
    }

    useEffect(() =>{
        getCourse();
    }, []);

    return (
        <>
        
        {courses ? (
                <div className="display" key={courses.id}>
                    <h1>{"Details Of "+courses.course_name}</h1>
                    <table border="">
                        <tr>
                            <th>Student Name</th>
                            <th>Registration number</th>
                            <th>Level</th>
                            <th>Course Code</th>
                            <th>Course Name</th>
                           
                        </tr>
                        <tr>
                            <td>{courses.user.name}</td>
                            <td>{courses.user.student_id}</td>
                            <td>{courses.level}</td>
                            <td>{courses.course_code}</td>
                            <td>{courses.course_name}</td>
                            <td> {user.id === courses.user_id &&
                                <div className="update">
                                    <Link to={`/courses/update/${courses.id}`}>Update</Link>  
                                    <form onSubmit={handleDelete}>
                                    <button>Delete</button>
                                </form>
                                </div>
                                            
                                }  </td>
                        </tr>
                        
                       
                    </table>
                     
                 

                               
                </div>

            ): <p>No course available</p>}
 
        </>
    )
}