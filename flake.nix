{
  description = "Bun development environment for Verdear";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }: let
    forAllSystems = nixpkgs.lib.genAttrs [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
  in {
    devShells = forAllSystems (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      default = pkgs.mkShell {
        packages = with pkgs; [
          bun
        ];

        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath (with pkgs; [
          stdenv.cc.cc.lib
          zlib
        ]);
      };
    });
  };
}
