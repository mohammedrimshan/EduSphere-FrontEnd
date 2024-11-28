const renderStudentRow = (student, index) => (
    <tr key={student.id} className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
      <td className={`px-6 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
        {index + 1}
      </td>
      <td className="px-6 py-4 flex items-center">
        <img className="h-8 w-8 rounded-full" src={student.avatar} alt="Avatar" />
        <div className="ml-4 text-sm font-medium">{student.name}</div>
      </td>
      <td className="px-6 py-4 text-sm">{student.id}</td>
      <td className="px-6 py-4 text-sm">{student.course}</td>
      <td className="px-6 py-4">
        <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
          student.status === "Active"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}>
          {student.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => toggleBlockStatus(student.id)}
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            student.isBlocked
              ? "bg-green-100 text-green-700 dark:bg-green-900"
              : "bg-red-100 text-red-700 dark:bg-red-900"
          }`}
        >
          {student.isBlocked ? <FaLockOpen /> : <FaLock />} {student.isBlocked ? "Unblock" : "Block"}
        </button>
      </td>
    </tr>
  );
  