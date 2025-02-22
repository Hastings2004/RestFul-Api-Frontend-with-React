import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/appContext";


export default function Show() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AppContext);

  const [course, setCourse] = useState(null);

  async function getCourse() {
    const res = await fetch(`/api/courses/${id}`);
    const data = await res.json();

    if (res.ok) {
      setCourse(data.course);
    }
  }

  async function handleDelete(e) {
    e.preventDefault();

    if (user && user.id === course.user_id) {
      const res = await fetch(`/api/courses/${id}`, {
        method: "delete",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/");
      }

      console.log(data);
    }
  }

  useEffect(() => {
    getCourse();
  }, []);

  return (
    <>
      {course ? (
        <div
          key={course.id}
          className="mt-4 p-4 border rounded-md border-dashed border-slate-400"
        >
          <div className="mb-2 flex items-start justify-between">
            <div>
              <table border="">
                          <tr>
                              <th>Student ID</th>
                              <th>Level</th>
                              <th>Course Code</th>
                              <th>Course Name</th>
                          </tr>
                          <tr>
                              <td>{course.student_id}</td>
                              <td>{course.level}</td>
                              <td>{course.course_code}</td>
                              <td>{course.course_name}</td>
                          </tr>
                </table>

            </div>
          </div>
          
          {user && user.id === course.user_id && (
            <div className="flex items-center justify-end gap-4">
              <Link
                to={`/courses/update/${course.id}`}
                className="bg-green-500 text-white text-sm rounded-lg px-3 py-1"
              >
                Update
              </Link>

              <form onSubmit={handleDelete}>
                <button className="bg-red-500 text-white text-sm rounded-lg px-3 py-1">
                  Delete
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <h3>Course not found!</h3>
      )}
    </>
  );
}
