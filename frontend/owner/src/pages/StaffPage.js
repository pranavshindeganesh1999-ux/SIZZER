import React, { useEffect, useState } from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';

const StaffPage = () => {

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch Staff From Backend
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/staff/salon/YOUR_SALON_ID', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStaff(data.data);
      }

    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const getStatusStyle = (active) =>
    active
      ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)' }
      : { color: '#f87171', background: 'rgba(248,113,113,0.1)' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f171e', color: '#f1f5f9', padding: '32px' }}>

      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Staff</h2>

      {loading ? (
        <p>Loading staff...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Specialization</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {staff.map(member => {
              const statusStyle = getStatusStyle(member.is_active);
              return (
                <tr key={member.id}>
                  <td>{member.first_name} {member.last_name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>{member.specialization}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      ...statusStyle
                    }}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {staff.length === 0 && !loading && (
        <p>No staff found</p>
      )}

    </div>
  );
};

export default StaffPage;
