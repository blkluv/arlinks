export function Avatar({avatarUrl, name, size = 16}: { avatarUrl: string | undefined, name?: string, size?: number }) {
  return (
    <div id="Avatar">
      <div className="flex flex-row w-fit max-w-full items-center gap-2">
        <div
          className="box-content"
          style={{position: "relative", width: size, height: size}}
        >
          <img
            src={avatarUrl || "https://arweave.net/OrG-ZG2WN3wdcwvpjz1ihPe4MI24QBJUpsJGIdL85wA"}
            width={size} height={size}
            alt={name || ""}
            className="object-cover min-h-full min-w-full aspect-square rounded-full overflow-hidden bg-white"
          />
        </div>

        {name &&
          <p className="grow text-xs sm:text-sm break-all">
            {name}
          </p>
        }
      </div>
    </div>
  )
}


export default Avatar;