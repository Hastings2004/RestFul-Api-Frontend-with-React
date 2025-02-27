import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/appContext";

export default function Home(){

    const {token} = useContext(AppContext);

    const [courses, setCourses] = useState([]);

    
    async function getCourses() {
        const response = await fetch("/api/courses", {
            method: 'get',
            headers:{
                Authorization: `Bearer ${token}`
            }
        });    
        
        const data = await response.json();

        if(response.ok){
            setCourses(data);
        }
    }

    useEffect(() => {
        getCourses();
    }, []);

    return(
        <>
            
                <div className="display">
                <h1>Registered courses</h1>
                <table border="">
                    <tr>
                        <th>Student Name</th>
                        <th>Registration number</th>
                        <th>Level</th>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>View</th>
                            
                    </tr>
                    
                        {courses.length > 0 ? courses.map(course =>(
                            
                            <tr key={course.id}>
                                
                                    <td>{course.user.name}</td>
                                    <td>{course.user.student_id}</td>        
                                    <td>{course.level}</td>
                                    <td>{course.course_code}</td>
                                    <td>{course.course_name}</td>
                                    <td><Link to={`/courses/${course.id}`}>show</Link></td>
                            
                            </tr>

                        )): <td>No course available</td>}
                    
                </table>
            </div>
        </>
        
    );
}