export default function Footer() {
  return (
    <div className="my-20 flex w-full justify-center">
      <p className="text-center text-sm text-secondary">
        Copyright © {new Date().getFullYear()} Numoen. All rights reserved.
      </p>
    </div>
  );
}
