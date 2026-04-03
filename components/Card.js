export default function Card({ children, className = '', hover = false, onClick, ...props }) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}


